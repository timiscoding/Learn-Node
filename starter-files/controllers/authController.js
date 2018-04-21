const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const moment = require('moment');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');
  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Oops. You must be logged in');
  res.redirect('/login');
};

exports.forgot = async (req, res) => {
  // 1. check email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash('error', 'No account with that email exists');
    return res.redirect('back');
  }

  // 2. create reset token and expiry
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = moment().add(1, 'hours').valueOf();
  await user.save();
  // 3. email the token
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  await mail.send({
    filename: 'password-reset',
    user,
    subject: 'Reset password',
    resetURL,
  });
  req.flash('success', `You have been emailed a password reset link`);
  // 4. redirect to /login
  res.redirect('/login');
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Reset password token invalid or expired');
    return res.redirect('/login');
  }

  res.render('reset', {title: 'Reset your password'});
};

exports.confirmedPasswords = (req, res, next) => {
  req.checkBody('password-confirm').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', 'Passwords do not match. Try again');
    return res.redirect('back');
  }
  next();
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Reset password token invalid or expired');
    return res.redirect('/login');
  }

  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Successfully updated password');
  res.redirect('/');
};
