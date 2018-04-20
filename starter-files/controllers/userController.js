const mongoose = require('mongoose');

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'});
};

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register'});
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name').notEmpty();
  req.checkBody('email', 'Invalid email address').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: true,
  });
  req.checkBody('password', 'Password cannot be blank').notEmpty();
  req.checkBody('password-confirm', 'Confirm password cannot be empty').notEmpty();
  req.checkBody('password-confirm', 'Oops. Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors.map(error => error.msg));
    res.render('register', {title: 'Register', body: req.body, flashes: req.flash() });
    return;
  }
  next();
};
