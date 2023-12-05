const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const projectRoot = path.join('intex', '/');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const User = require('.models/userModel.js');
var stylesheets = '';
const baseDir = __dirname;

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => User.findOne({ where: { email } }),
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

const sequelize = new Sequelize('provo-city', 'postgres', 'Rut27.6161.90-3', {
    host: 'localhost',
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Use only if using a self-signed certificate or if not using a certificate
        },
      },
  });

app.get("/", (req, res) => { 
    res.render('index.ejs')});

//LOGIN PAGE STUFF
app.get("/login", (req, res) => { 
    res.render('login.ejs')});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    }));

//REGISTER PAGE STUFF
app.get("/register", (req, res) => { 
    res.render('register.ejs')});

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
        // Create a new user instance and save it to the database
        const newUser = await User.create({
            email: req.body.email,
            password: hashedPassword,
        });
    
        console.log('New user created:', newUser);
    
        res.redirect('/login');
        } catch (error) {
        console.error(error);
        res.redirect('/register');
        }
});

//ADMIN PAGE STUFF
app.get("/admin", (req, res) => { 
    res.render('admin.ejs')});

app.get("/dashboard", (req, res) => { 
    res.render('dashboard.ejs')});

app.get("/survey", (req, res) => { 
    res.render('survey.ejs')});


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

module.exports = sequelize;

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
