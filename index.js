//GROUP 2-15
//Conway Hogan
//Tiffany Hansen
//Elliot Pi
//Jaden Gatherum

//Installing all middleware and neccessary packages
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

//initializing passport from passport-config (used for authentication)
const initializePassport = require('./passport-config');
const { or } = require('sequelize');
initializePassport(
    passport,
    username => User.findOne({ where: { username } }),
    id => User.findByPk(id)
);

//using ejs files for views
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

//using session for users as well as flash messages
app.use(flash());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//telling where the views are
app.set('views', path.join(baseDir, 'views'))

//telling where css is
app.use(express.static(path.join(baseDir)));

//home page get route
app.get("/", async (req, res) => {
    //has their authentication status and their user detials passed in
    res.render('index.ejs', { isAuthenticated: req.isAuthenticated(), user: req.user });
});

//LOGIN PAGE STUFF
app.get("/login", checkNotAuthenticated, (req, res) => { 
    res.render('login.ejs', { isAuthenticated: req.isAuthenticated() });
    });

//handles login form using passport
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
    }));

//LOGOUT PAGE STUFF
app.get("/logout", async (req, res) => { 
    res.render('logout.ejs', { isAuthenticated: req.isAuthenticated(), user: req.user });
    });

//logout form 
app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
        return next(err);
        }
        res.redirect('/'); // Redirect to the home page
    });
    });

//REGISTER PAGE STUFF
app.get("/register", checkAuthenticated, async (req, res) => { 
    res.render('register.ejs', { isAuthenticated: req.isAuthenticated(), user: req.user });
    });

//handles the register form by creating a new user model when submited 
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
        
            //uses appropraite flash messages

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
//edit user page route
app.get("/edit", checkAuthenticated, async (req, res) => {
    const allusers = await User.findAll();
    res.render('edit.ejs', { user: req.user, isAuthenticated: req.isAuthenticated(), myusers: allusers});
    });

//edit user page form that updates the user record for the current user
app.post('/edit', checkAuthenticated, async (req, res) => {
    if(req.body.password === req.body.cpassword) {
        try {
            // Update user information in the database
            //hashes the password before it is stored in the database
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
                //finds the current user and uses where to compare it to the database only updating that user
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
        //displays the error if the passwords dont match
        req.flash('error', 'Passwords do not match. User not edited. Try Again');
        res.redirect('/edit');
    }
    });

//ADMIN PAGE STUFF
app.get("/results", checkAuthenticated, async (req, res) => { 
    //gets all associated models
    const records = await PersonalInfo.findAll();
    const socialmedias = await SocialMedia.findAll();
    const organizations = await Organization.findAll();
    const platforms = await Platform.findAll();
    //passes all of those models into the view
    res.render('admin.ejs', { isAuthenticated: req.isAuthenticated(), 
        myrecords: records, 
        mysocials: socialmedias, 
        myorganizations: organizations, 
        myplatforms: platforms,
        user: req.user });
    });

//not using rn but would maybe use in a later version
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

//post route for the little search bar for individual posts that basically just puts it in the url
app.post('/search', (req, res) => {
    const searchText = req.body.searchText;
    const searchUrl = "/singleresult" + searchText;
    res.redirect(searchUrl);
  });

//dynamic get route for individual posts that uses all the same models
app.get("/singleresult:EntryID", checkAuthenticated, async (req, res) => {
    //gets entry id from url
    const entryID = req.params.EntryID;
    //looks in database by url
    const records = await PersonalInfo.findAll({ where: { EntryID: entryID } });
    const socialmedias = await SocialMedia.findAll({ where: { EntryID: entryID } });
    const organizations = await Organization.findAll();
    const platforms = await Platform.findAll();
    res.render('singlesurvey.ejs', { isAuthenticated: req.isAuthenticated(),
        myrecords: records,
        mysocials: socialmedias, 
        myorganizations: organizations, 
        myplatforms: platforms,
        user: req.user });
    });

//get route for the admin edit page
app.get("/adminedit", isAdmin, async (req, res) => { 
    const allusers = await User.findAll();
    res.render('adminedit.ejs', { isAuthenticated: req.isAuthenticated(), myusers: allusers, user: req.user });
    });

//get route for the dashboard
app.get("/dashboard", async (req, res) => {
    res.render('dashboard.ejs', { isAuthenticated: req.isAuthenticated(), user: req.user });
    });

//route to delete users from the manage users page
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
app.get("/survey", async (req, res) => { 
    res.render('survey.ejs', { isAuthenticated: req.isAuthenticated(), user: req.user });
    });

//route to create new survey entries! 
app.post('/survey', async (req, res) => {
    try {
        const personalInfo = await PersonalInfo.create({
            Age: req.body.age,
            Gender: req.body.gender,
            RelationshipStatus: req.body.relationship,
            OccupationStatus: req.body.occupation,
            //location automatically set to provo
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
        const selectedPlatforms = req.body.socialMedia; // array of selected platform IDs
        const selectedOrganizations = req.body.affiliated; // array of selected organization IDs

        //loops through creating the appropriate number of socialmedia table entries based on how many
        //platforms and organizations they selected
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


// functions to check authentication using is authenticated from passport
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

//listen!
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
