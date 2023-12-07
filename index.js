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
const { or } = require('sequelize');
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
            req.flash('error', 'That Username or Email is already in use. Choose another or log in to your existing account.');
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
    res.render('edit.ejs', { user: req.user, isAuthenticated: req.isAuthenticated()});
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
app.get("/results", checkAuthenticated, async (req, res) => { 
    const records = await PersonalInfo.findAll();
    const socialmedias = await SocialMedia.findAll();
    const organizations = await Organization.findAll();
    const platforms = await Platform.findAll();
    res.render('admin.ejs', { isAuthenticated: req.isAuthenticated(), 
        myrecords: records, 
        mysocials: socialmedias, 
        myorganizations: organizations, 
        myplatforms: platforms });
    });

// app.get("/response/:EntryID", checkAuthenticated, async (req, res) => {
//     const entryID = req.params.EntryID;
//     const socialmedias = await SocialMedia.findAll({ where: { EntryID: entryID } });
//     const organizations = await Organization.findAll();
//     const platforms = await Platform.findAll();
//     res.render('oneresponse.ejs', { isAuthenticated: req.isAuthenticated(), 
//         mysocials: socialmedias, 
//         myorganizations: organizations, 
//         myplatforms: platforms });
// });

app.post('/search', (req, res) => {
    const searchText = req.body.searchText;
    const searchUrl = "/singleresult" + searchText;
    res.redirect(searchUrl);
  });

app.get("/singleresult:EntryID", checkAuthenticated, async (req, res) => {
    const entryID = req.params.EntryID;
    const records = await PersonalInfo.findAll({ where: { EntryID: entryID } });
    const socialmedias = await SocialMedia.findAll({ where: { EntryID: entryID } });
    const organizations = await Organization.findAll();
    const platforms = await Platform.findAll();
    res.render('singlesurvey.ejs', { isAuthenticated: req.isAuthenticated(),
        myrecords: records,
        mysocials: socialmedias, 
        myorganizations: organizations, 
        myplatforms: platforms });
    });

app.get("/adminedit", isAdmin, async (req, res) => { 
    const allusers = await User.findAll();
    res.render('adminedit.ejs', { isAuthenticated: req.isAuthenticated(), myusers: allusers });
    });

app.get("/dashboard", (req, res) => { 
    res.render('dashboard.ejs', { isAuthenticated: req.isAuthenticated() });
    });

app.post("/deleteUser/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            req.flash('error', 'Error. User not deleted');
            res.redirect('/adminedit');
          }

        await user.destroy();
        req.flash('success', 'User deleted');
        res.redirect('/adminedit');
    } catch (error) {
        req.flash('error', 'Error. User not deleted');
        res.redirect('/adminedit');
    }
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
            OftenSpent: req.body.q1,
            Restless: req.body.q3,
            Distracted: req.body.q4,
            Worries: req.body.q5,
            Concentration: req.body.q6,
            CompareSuccess: req.body.q7,
            FeelAboutComparison: req.body.q8,
            SeekValidation: req.body.q9,
            Depressed: req.body.q10,
            InterestDailyActivites: req.body.q11,
            Sleep: req.body.q12,
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
        return res.redirect('/');
    }
    next();
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
