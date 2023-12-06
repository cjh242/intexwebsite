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
const SocialMedia = require('./models/socialMediaModel.js');
const PersonalInfo = require('./models/personalInfoModel.js');
const Platform = require('./models/platformModel.js');
const Organization = require('./models/organizationModel.js');
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

//LOGOUT PAGE STUFF
app.get("/logout", (req, res) => { 
    res.render('logout.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
        return next(err);
        }
        res.redirect('/'); // Redirect to the home page
    });
    });

//REGISTER PAGE STUFF
app.get("/register", checkAuthenticated, (req, res) => { 
    res.render('register.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post('/register', async (req, res) => {
    if(req.body.password === req.body.cpassword) {
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
        
            req.flash('success', 'User registered successfully!');
            res.redirect('/register');
        } catch (error) {
            console.error(error);
            req.flash('error', 'An error occurred during registration.');
            res.redirect('/register');
        }
    }
    else {
        req.flash('error', 'Passwords do not match. User not registered. Try Again');
        res.redirect('/register');
    }
});
//EDIT USER PAGE STUFF
app.get("/edit", checkAuthenticated, (req, res) => { 
    res.render('edit.ejs', { user: req.user, isAuthenticated: req.isAuthenticated() });
    });

app.post('/edit', checkAuthenticated, async (req, res) => {
    if(req.body.password === req.body.cpassword) {
        try {
            // Update user information in the database
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const [numRowsUpdated, updatedUser] = await User.update(
            {
                firstName: req.body.fname,
                lastName: req.body.lname,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                
            },
            {
                where: { id: req.user.id },
                returning: true, // Return the updated user
            }
            );
        
            if (numRowsUpdated > 0) {
            res.redirect('/');
            } else {
            res.redirect('/edit');
            }
        } catch (error) {
            // Handle the error
            console.error(error);
            res.redirect('/edit');
        }
    }
    else {
        req.flash('error', 'Passwords do not match. User not edited. Try Again');
        res.redirect('/edit');
    }
    });

//ADMIN PAGE STUFF
app.get("/admin", checkAuthenticated, (req, res) => { 
    res.render('admin.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.get("/adminedit", isAdmin, (req, res) => { 
    res.render('adminedit.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.get("/dashboard", (req, res) => { 
    res.render('dashboard.ejs', { isAuthenticated: req.isAuthenticated() });
    });

//SURVEY PAGE STUFF
app.get("/survey", (req, res) => { 
    res.render('survey.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post('/survey', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.create({
            Age: req.body.age,
            Gender: req.body.gender,
            RelationshipStatus: req.body.relationship,
            OccupationStatus: req.body.occupation,
            Location: 'Provo',
            UseSocialMedia: req.body.yesno,
            AvgTimeSpent: req.body.timeDuration,
            OftenSpent: req.body.purpose,
            Restless: req.body.distracted,
            Distracted: req.body.distracted2,
            Worries: req.body.worries,
            Concentration: req.body.concentrate,
            CompareSuccess: req.body.compare,
            FeelAboutComparison: req.body.feel,
            SeekValidation: req.body.validation,
            Depressed: req.body.depressed,
            InterestDailyActivites: req.body.interest,
            Sleep: req.body.sleep,
        });
        const selectedPlatforms = req.body.socialMedia; // Assuming an array of selected platform IDs
        const selectedOrganizations = req.body.affiliated; // Assuming an array of selected organization IDs

        for (const platformId of selectedPlatforms) {
            for (const organizationId of selectedOrganizations) {
                const socialMedia = await SocialMedia.create({
                    EntryID: personalInfo.EntryID,
                    Age: req.body.age,
                    Gender: req.body.gender,
                    OrganizationID: organizationId,
                    PlatformID: platformId,
                });
            }
        }
        req.flash('success', 'Survey response recorded!');
        res.redirect('/');
    } catch  (error) {
        // Handle the error
        req.flash('error', 'Survey not submitted. Please try again.');
        console.error(error);
        res.redirect('/survey');
    }
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

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.username === 'admin') {
      return next();
    }
    req.flash('error', 'You are not logged in as the admin user');
    res.redirect('/login'); // Redirect unauthorized users
  }

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
