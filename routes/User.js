const express = require('express');
const router = express.Router();

// importing the required controllers and middleware function

const {logIn,signUp,sendOTP,changePassword} = require('../controllers/Auth');

const {resetPassword,resetPasswordToken} = require('../controllers/ResetPassword');

const {auth} = require('../middlwares/auth');

// ********************************************************************************* 
//                             Authentication routes
// **********************************************************************************

// router for user login
router.post("/logIn",logIn);

// router for user signup
router.post("/signUp",signUp);

// router for sending OTP to the user email
router.post("/sendOtp",sendOTP);

// router for chagnePassword
router.post("/changePassword",auth,changePassword);

// ********************************************************************************* 
//                            Reset Password
//**********************************************************************************

// routes for generation a reset password token
router.post("/reset-password-token",resetPasswordToken);

// routes for resetting user's password after verification
router.post("/reset-password",resetPassword);

//export the router for use in app
module.exports = router;