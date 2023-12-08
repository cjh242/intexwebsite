//GROUP 2-15
//Conway Hogan
//Tiffany Hansen
//Elliot Pi
//Jaden Gatherum

//passport config file used for authentication
//completely standard passport configuration
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./index.js');

//login logic
function initializePassport(passport, getUserByUsername, getUserById) {
  const authenticateUser = async (username, password, done) => {
    const user = await getUserByUsername(username)
    if (user == null) {
      return done(null, false, { message: 'No user with that email' })
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  //clarifying local strategy
  passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser( async (id, done) => {
    try {
      const user = await getUserById(id);
      return user ? done(null, user) : done(null, false);
    } catch (error) {
      return done(error);
    }
  });
}

//export to other files
module.exports = initializePassport;