const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const projectRoot = path.join('intex', '/');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('./models/userModel.js');
const sequelize = require('./db');
var stylesheets = '';
const baseDir = __dirname;

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    username => User.findOne({ where: { username } }),
    id => User.findByPk(id)
);

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.set('views', path.join(baseDir, 'views'))
app.use(express.static(path.join(baseDir)));

app.get("/", (req, res) => { 
    res.render('index.ejs', { isAuthenticated: req.isAuthenticated() });
});

//LOGIN PAGE STUFF
app.get("/login", (req, res) => { 
    res.render('login.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    }));

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
        return next(err);
        }
        res.redirect('/'); // Redirect to the home page
    });
    });

//REGISTER PAGE STUFF
app.get("/register", (req, res) => { 
    res.render('register.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post('/register', checkAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        // Create a new user instance and save it to the database
        const newUser = await User.create({
            firstName: req.body.fname,
            lastName: req.body.lname,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
    
        console.log('New user created:', newUser);
    
        res.redirect('/register');
        } catch (error) {
        console.error(error);
        res.redirect('/register');
        }
});

//ADMIN PAGE STUFF
app.get("/admin", checkAuthenticated, (req, res) => { 
    res.render('admin.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.get("/dashboard", (req, res) => { 
    res.render('dashboard.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.get("/survey", (req, res) => { 
    res.render('survey.ejs', { isAuthenticated: req.isAuthenticated() });
    });


function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
    
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
