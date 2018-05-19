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
const db = require('./server/config/db');
const router = require('./server/router/index');
const env = require('./server/config/env');

const app = express();
const port = env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}))
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

router(app, db);
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

// table that passport creates. it is a passport helper
const SequelizeStore = require('connect-session-sequelize')(session.Store)



const sessionStore = new SequelizeStore({
    db: sequelize
})

sequelize.sync()
sessionStore.sync();

app.use(require('morgan')('combined'));
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const models = require('./server/models/passport');
require('./config/passport.js')(passport, models.users);
const users = require('./server/models/users');
const pics = require('./server/models/pics');


// pic related
// const Pic = sequelize.define('pic', {
//     description: Sequelize.STRING,
//     image: Sequelize.STRING,
//     tag: Sequelize.STRING,
//     comment: Sequelize.STRING
// })

// const Tag = sequelize.define('tag', {
//     tag: Sequelize.STRING,
//     username: Sequelize.STRING
// })

// Pic.hasMany(Tag);
// Tag.belongsTo(Pic);

// const ReplyComment = sequelize.define('replycomment', {
//     comment: Sequelize.STRING,
//     username: Sequelize.STRING
// })

// const UserPic = sequelize.define('userpic', {
//     userId: Sequelize.STRING,
//     picId: Sequelize.STRING
// })

// Pic.hasMany(ReplyComment);
// ReplyComment.belongsTo(Pic);

// User.belongsToMany(Pic, {
//     through: UserPic
// });
// Pic.belongsToMany(User, {
//     through: UserPic
// });

// sequelize.sync();

// // storage object definition
// // where to store files and how to name them

// const storage = multer.diskStorage({
//     destination: './public/uploads',
//     filename: (req, file, cb) => {
//         // fieldnmae is name="photo", - "154461".jpg. naming convention 
//         // has to be unique.
//         // Date.now() would be different for everyone.
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
//     }
// })

// // upload process definition
// const upload = multer({
//     storage: storage
// }).single('image');

// // const app = express();
// app.set('view engine', 'ejs');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }))

// app.use(express.static('public'));

// let description;
// let username;
// let tag;
// let comment;

// // get route
// app.get('/heregram', (req, res) => {
//     Pic.findAll().then((rows) => {
//         return rows
//     })
//     .then((rows) => {
//         return res.render('pages/heregram', {rows, description, username, tag, comment })
//     })
// })

// // upload route
// app.post('/upload', (req, res) => {
//     upload(req, res, (err) => {
//         if(err) {
//             console.log(err);
//         }
//         console.log(req.body);
//         console.log(req.file);
//         console.log('File for sharp ' + req.file.path);

//         sharp(req.file.path)
//         .resize(100, 100)
//         .toFile('public/thumbnails/' + req.file.filename, (err) => {

//         })
//         Pic.create({
//             description: req.body.description,
//             username: req.body.username,
//             image: req.file.filename,
//             tag: req.body.tag,
//             comment: req.body.comment
//         })
//         .then(() => {
//             return res.redirect('/heregram');
//         })
//     })
// })

// // render edit-upload page
// app.post('/edit/:id', (req, res) => {
//     let id = req.params.id;
//     Pic.findById(id)
//     .then(row => {
//         return row
//     })
//     .then(row => res.render('pages/edit-upload', {
//         row
//     }))
// })

// // update upload
// app.post('/update/:id', (req, res) => {
//     let id = req.params.id;
//     Pic.findById(id)
//     .then((row) => row.update({
//         description: req.body.description,
//         username: req.body.username,
//         tag: req.body.tag,
//         comment: req.body.comment
//     }))
//     return res.redirect('/heregram');
// })

// // delete image
// app.post('/delete/:id', (req, res) => {
//     let id = req.params.id;
//     Pic.findById(id)
//     .then((row) => row.destroy({
//         where: {
//             id: req.params.id
//         }
//     }))
//     return res.redirect('/heregram');
// })

// // render add reply pages
// app.get('/reply', (req, res) => {
//     res.render('pages/reply');
// })

// // add reply to user comment
// app.post('/add', (req, res) => {
//     ReplyComment.create({
//         comment: req.body.comment,
//         username: req.body.username
//     })
//     .then(() => {
//         return res.redirect('/heregram')
//     })
// })

// drop and resync with {force: true}
db.sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} ...`);
    })
})
