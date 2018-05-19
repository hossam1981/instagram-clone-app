module.exports = (app, passport, user) => {

    // routes related to passport/users
    app.get('/', (req, res) => {
        if(req.user) {
            res.render('pages/homepage', {
                user: req.user
            })
        } else {
            res.redirect('pages/login')
        }
    })

    app.get('/register', (req, res) => {
        return res.render('pages/register');
    })

    app.post('/signup', (req, res) => {
        passport.authenticate('local-signup', (err, user) => {
            if(err) {
                return next(err);
            } else {
                return res.redirect('pages/login');
            }
        })(req, res, next);
    })

    app.post('/login', (req, res, next) => {
        passport.authenticate('local-login', (err, user) => {
            console.log(`Another login for user : ${req.user}.`);
            if(err || user === false) {
                return res.render('login', {
                    message: `Incorrect Username/Password`
                })
            } else {
                req.login(user, (err) => {
                    console.log(`Getting req.user : ${req.user}.`);
                    return res.render('pages/homepage', {
                        user: req.user
                    })
                })
            }
        })(req, user, next);
    })

    app.get('/login', (req, res) => {
        return res.render('pages/login', {
            message: `Please login!`
        })
    })

    app.get('/profile', 
    require('connect-ensure-login').ensureLoggedIn(), (req, res) => {
        console.log(`${req.user}`);
        user.findById(req.user.id).then((user) => {
            res.render('pages/profile', {
                user: user.dataValues
            })
        })
    })

    // deletes your session in your db. comes from passport and works in
    // conjunction with express sessions.
    app.get('/logout', (req, res) => {
        console.log(`Logging out!`);

        req.ression.destroy();
        req.logout();
        res.redirect('pages/login');
    })
}