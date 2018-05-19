const express = require('express');
const ejs = require('ejs');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const passport = require('passport')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const LocalStrategy = require('passport-local').Strategy
const pg = require('pg');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.load();

// table that passport creates. it is a passport helper
const SequelizeStore = require('connect-session-sequelize')(session.Store)

// define environment variables
const db_name = process.env.DB_NAME;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;

const Op = Sequelize.Op;

const sequelize = new Sequelize(db_name, db_user, db_pass, {
    host: 'localhost',
    port: '5432',
    dialect: 'postgres',
    operatorsAliases: {
        $and: Op.and,
        $or: Op.or,
        $eq: Op.eq,
        $like: Op.like,
        $iLike: Op.iLike
    }
})

// user registration/login related
const User = sequelize.define('user', {
    lastname: Sequelize.STRING,
    firstname: Sequelize.STRING,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    cell: Sequelize.STRING,
    email: Sequelize.STRING,
    comment: Sequelize.STRING,
    tag: Sequelize.STRING
})


const sessionStore = new SequelizeStore({
    db: sequelize
})

sequelize.sync()
sessionStore.sync();

const app = express()

//===============Sessions======================== 
/*
In a typical web application, the credentials used to authenticate
  a user will only be transmitted during the login request. 
  If authentication succeeds, a session will be established and 
  maintained via a cookie set in the user's browser.
Each subsequent request will not contain credentials, but rather
 the unique cookie that identifies the session. In order to support 
 login sessions, Passport will serialize and deserialize user 
 instances to and from the session.
*/
//create cookie & with id and link cookie to user detail info

passport.serializeUser(function(user, done) {
    console.log("*********SerializeUser*********")
        //done(null, {id: user.id, user: user.username});
    done(null, user)
});
//convert id in cookie to user details
passport.deserializeUser(function(obj, done) {
    console.log("--deserializeUser--");
    console.log(obj);
    done(null, obj);
})

//================Start Passport Local Config==================
//Passport Sign-up. allows us to register users. first time use because before we already had
// users. Now not initally. If want to use email, then replace 'username' with 'email'.
passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, processSignupCallback)); // <<-- more on this to come

// tries to find a user. if not, will create that account for you. very similar to how
// we have used sequelize in the past.
function processSignupCallback(req, username, password, done) {
    // first search to see if a user exists in our system with that email
    User.findOne({
            where: {
                'username': username
            }
        })
        .then((user) => {
            if (user) {
                // user exists call done() passing null and false
                return done(null, false);
            } else {

                // create the new user
                // creating the properties in the form itself.
                // this is a shortcut way of creating the user table
                let newUser = req.body; // make this more secure
                User.create(newUser)
                    .then((user) => {
                        //once user is created call done with the created user
                        // createdRecord.password = undefined;
                        console.log("Yay!!! User created");

                        // console.log(user)
                        return done(null, user);
                    })
            }
        })
}
//-------------End of Passport Sign-up-----------

//-------------Start of Passport Login-----------

// Local Strategy
passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, processLoginCallback)); // <<-- more on this to come

function processLoginCallback(req, username, password, done) {
    // first search to see if a user exists in our system with that email
    User.findOne({
            where: {
                'username': username
            },
        })
        .then((user) => {
            if (!user) {
                // user exists call done() passing null and false
                return done(null, false);
            } else if (password !== user.password) {
                return done(null, false)
            } else {
                console.log("Yay!!! User is logged in.");

                // console.log(user)
                return done(null, user);
            }
        })
}

app.use(require('morgan')('combined'));
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'))
app.use(cookieParser());

app.use(session({
    secret: 'keyboard cat',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

//================ Passport Middleware ==============
/*
In an Express-based application, passport.initialize() middleware
is required to initialize Passport. If your application uses persistent
login sessions, passport.session() middleware must also be used.
*/
app.use(passport.initialize());
app.use(passport.session());

//=========Routes==================
app.get('/', (req, res) => {
    if (req.user) {
        res.render('pages/homepage', {
            user: req.user
        })
    } else {
        res.redirect('pages/login')
    }
})

app.get('/register', (req, res) => {
    return res.render('pages/register')
})

app.post('/signup', function(req, res, next) {
    passport.authenticate('local-signup', function(err, user) {
        if (err) {
            return next(err);
        } else {
            return res.redirect('pages/login')
        }
    })(req, res, next);
})

app.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user) {
        console.log("Another login for user  :" + req.user)
        if (err || user === false) {
            return res.render('pages/login', {
                message: "Incorrect Username/Password"
            })
        } else {
            req.login(user, function(err) {
                console.log("Getting req.user :" + req.user)
                return res.render('pages/homepage', {
                    user: req.user
                })
            })
        }
    })(req, res, next);
})


app.get('/login', (req, res) => {
    return res.render('pages/login', {
        message: "Please login"
    })
})

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(), function(req, res) {
    console.log("****The req.user****" + req.user)
    User.findById(req.user.id).then((user) => {
        res.render('pages/profile', {
            user: user.dataValues
        });
    })
})

app.get('/logout', function(req, res) {
    console.log("*****Logging out*****");

    // deletes your session in your db. comes from passport and works in
    // conjunction with express sessions.
    req.session.destroy()
    req.logout();
    res.redirect('pages/login');
})

// pic related
const Pic = sequelize.define('pic', {
    description: Sequelize.STRING,
    image: Sequelize.STRING,
    tag: Sequelize.STRING,
    comment: Sequelize.STRING
})

const Tag = sequelize.define('tag', {
    tag: Sequelize.STRING,
    username: Sequelize.STRING
})

Pic.hasMany(Tag);
Tag.belongsTo(Pic);

const ReplyComment = sequelize.define('replycomment', {
    comment: Sequelize.STRING,
    username: Sequelize.STRING
})

const UserPic = sequelize.define('userpic', {})

Pic.hasMany(ReplyComment);
ReplyComment.belongsTo(Pic);

User.belongsToMany(Pic, {
    through: UserPic
});
Pic.belongsToMany(User, {
    through: UserPic
});

sequelize.sync();

// storage object definition
// where to store files and how to name them

const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: (req, file, cb) => {
        // fieldnmae is name="photo", - "154461".jpg. naming convention 
        // has to be unique.
        // Date.now() would be different for everyone.
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

// upload process definition
const upload = multer({
    storage: storage
}).single('image');

// const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(express.static('public'));

let description;
let username;
let tag;
let comment;

// get route
app.get('/heregram', (req, res) => {
    Pic.findAll().then((rows) => {
        return rows
    })
    .then((rows) => {
        return res.render('pages/heregram', {rows, description, username, tag, comment })
    })
})

// upload route
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
        }
        console.log(req.body);
        console.log(req.file);
        console.log('File for sharp ' + req.file.path);

        sharp(req.file.path)
        .resize(100, 100)
        .toFile('public/thumbnails/' + req.file.filename, (err) => {

        })
        Pic.create({
            description: req.body.description,
            username: req.body.username,
            image: req.file.filename,
            tag: req.body.tag,
            comment: req.body.comment
        })
        .then(() => {
            return res.redirect('/heregram');
        })
    })
})

// render edit-upload page
app.post('/edit/:id', (req, res) => {
    let id = req.params.id;
    Pic.findById(id)
    .then(row => {
        return row
    })
    .then(row => res.render('pages/edit-upload', {
        row
    }))
})

// update upload
app.post('/update/:id', (req, res) => {
    let id = req.params.id;
    Pic.findById(id)
    .then((row) => row.update({
        description: req.body.description,
        username: req.body.username,
        tag: req.body.tag,
        comment: req.body.comment
    }))
    return res.redirect('/heregram');
})

// delete image
app.post('/delete/:id', (req, res) => {
    let id = req.params.id;
    Pic.findById(id)
    .then((row) => row.destroy({
        where: {
            id: req.params.id
        }
    }))
    .then((row) => row.update({
        description: req.body.description,
        username: req.body.username,
        tag: req.body.tag,
        comment: req.body.comment
    }))
    return res.redirect('/heregram');
})

// render add reply pages
app.get('/reply', (req, res) => {
    res.render('pages/reply');
})

// add reply to user comment
app.post('/add', (req, res) => {
    let id = req.body.id;
    User.findById(id)
    User.create({
        username: req.body.username,
        comment: req.body.comment
    })
    .then(() => {
        res.redirect('/heregram');
    })
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} ...`);
})
