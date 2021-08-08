const express = require('express');
const router = express.Router();
const user = require('../models/user');
const subs = require('../models/subs');
const contact = require('../models/contact');
const bcryptjs = require('bcryptjs');
const passport = require('passport');
require('./passportLocal')(passport);

function checkAuth(req, res, next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    }else{
        req.flash('error_message', "Please login to continue!");
        res.redirect('/login');
    }
}
router.get('/', (req, res) => {
    if(req.isAuthenticated()){
        res.render("index", { logged: true });
    }else{
        res.render("index", { logged: false });
    }
});

router.get('/login', (req, res) => {
    res.render("login");
});

router.get('/signup', (req, res) => {
    res.render("signup");
});

router.post('/signup', (req, res) => {
    const { email, username, password, confirmpassword } = req.body;
    if (!email || !username || !password || !confirmpassword ){
        res.render("signup", { err: "All Fields Required!" });
    }else if(password != confirmpassword){
        res.render("signup", { err: "Passwords don't match!" });
    }else{
        user.findOne({ $or: [{ email: email }, { username: username }]}, (err, data) => {
            if(err) throw err;
            if(data){
                res.render("signup", { err: "User Exists, Try logging in!"})
            }else{
                bcryptjs.genSalt(12, (err, salt) => {
                    if (err) throw err;
                    bcryptjs.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        user({
                            username: username,
                            email: email,
                            password: hash,
                            googleId: null,
                            provider: 'email',
                        }).save((err, data) => {
                            if(err) throw err;
                            res.redirect("/login");
                        })
                    })
                })
            }
        })
    }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/profile',
        failureFlash: true,
    })(req, res, next);
});
router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        res.redirect('/')
    })
});

router.get('/profile', checkAuth, (req, res) => {
    res.render('profile', { username: req.user.username, verified: req.user.isVerified })
});

router.get('/add', checkAuth, (req, res) => {
    res.render('add');
});
router.post("/add-subs", checkAuth, (req, res) => {
    const username = req.user.username;
    const title = req.body.title;
    const desc = req.body.desc;
    const expr_date = req.body.expr_date;
    const url = req.body.url;
    const platform = req.body.platform;
    const newSubscription = new subs({
        username,
        title,
        desc,
        expr_date,
        url,
        platform
    });
    newSubscription
      .save()
      .then(() => {
        //DO THIS FOR EACH USER
        res.redirect("/add");
      })
      .catch((err) => console.log(err));
});

router.get("/explore", checkAuth, (req, res) => {
    var explore;
    subs.find({username: {$ne: req.user.username}}, (err, data) => {
        if (err) {
        console.log(err);
        }
        if (data) {
        explore = data;
        }
        res.render("explore", { data: explore });
    });
});
router.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const sub = req.body.sub;
    const msg = req.body.msg;
    const newContact = new contact({
        name,
        email,
        sub,
        msg,
    });
    newContact
      .save()
      .then(() => {
        //DO THIS FOR EACH USER
        res.redirect("/");
      })
      .catch((err) => console.log(err));
});

router.use(require('./userRoutes'));
module.exports = router;