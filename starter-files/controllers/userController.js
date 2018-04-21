const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
  res.render('login', {title: 'Login'});
};

exports.registerForm = (req, res) => {
  res.render('register', {title: 'Register'});
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name').trim();
  req.sanitizeBody('name').whitelist('\\w');
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

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render('account', {title: 'Edit your account'});
};

exports.updateAccount = async (req, res) => {
  const updates = {
    email: req.body.email,
    name: req.body.name
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    {
      new: true,
      runValidators: true,
      context: 'query'
  });
  req.flash('success', 'Successfully updated your account');
  res.redirect('back');
};
