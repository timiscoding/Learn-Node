const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  sucessRedirect: '/',
  successFlash: 'You are now logged in!'
});
