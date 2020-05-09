var express = require('express');

var router = express.Router();

var register = require('./register.route');
var login = require('./login.route');
var forgotPassword = require('./forgotPassword.route');
var resetPassword = require('./resetPassword.route');
var changePassword = require('./changePassword.route');
var getMe = require('./getMe.route');
var updateProfile = require('./updateProfile.route');
var updateAvatar = require('./updateAvatar.route');
var verifyUser = require('./verifyUser.route');

router.use('/Register', register.route);
router.use('/Login', login.route);
router.use('/ForgotPassword', forgotPassword.route);
router.use('/ResetPassword', resetPassword.route);
router.use('/ChangePassword', changePassword.ProtectedRoute);
router.use('/GetMe', getMe.ProtectedRoute);
router.use('/UpdateProfile', updateProfile.ProtectedRoute);
router.use('/UpdateAvatar', updateAvatar.ProtectedRoute);
router.use('/Verify', verifyUser.route);

var users = { router };

module.exports = users;
