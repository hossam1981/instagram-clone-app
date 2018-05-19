module.exports = (passport, user) => {
    // const User = user;
    
    //Sessions
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
        console.log(`Serialize user ...`);
        done(null, user);
    })

    //conviert id in cookie to user details
    passport.deserializeUser(function(obj, done) {
        console.log(`Deserialize user ...`);
        console.log(obj);
        done(null, obj);
    })

    // start Passport Local Config
    //Passport Sign-up. allows us to register users. first time use because before we already had
    // users. Now not initally. If want to use email, then replace 'username' with 'email'.
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, processSignupCallback));

    // tries to find a user. if not, will create that account for you. very similar to how
    // we have used sequelize in the past.
    function processSignupCallback(req, username, password, done) {
        // first search to see if a user exists in system
        user.findOne({
            where: {
                'username': username
            }
        })
        .then((user) => {
            if (user) {

                // user exists call done() passing null and false
                return done(null, user);
            } else {
                
                // create the new user
                // creating the properties in the form itself.
                // this is a shortcut way of creating the user table
                let newUser = req.body;
                user.create(newUser)
                .then((user) => {

                     //once user is created call done with the created user
                    // createdRecord.password = undefined;
                    console.log(`Yay! User has been created ...`);

                    // console.log(user)
                    return done(null, user);
                })
            }
        })
    }
    /* End of Passport signup */

    /* Start of Passport Login */

    // Local Strategy
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, processLoginCallback));

    function processLoginCallback(req, username, password, done) {

        // first search to see if a user exists in our system
        user.findOne({
            where: {
                'username': username
            },
        })
        .then((user) => {
            if(!user) {

                // user exists call done() passing null and false
                return done(null, user);                
            } else if (password !== user.password) {
                return done(null, user);
            } else {
                console.log(`Yay! User is logged in ...`);
                
                // console.log(user)
                return done(null, user);
            }
        })        
    }
}