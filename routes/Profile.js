const express = require('express');
const router = express.Router();

const {auth} = require('../middlwares/auth');

const {updateProfile,deleteAccount,getAllUsersDetails,
    updateDisplayPicture,getEnrolledCourses} = require('../controllers/Profile');
 

// **********************************************************************
                // routes for profile
// **********************************************************************


// all about user details
router.put('/updateProfile',auth,updateProfile);
router.delete('/deleteProfile',auth,deleteAccount);
router.get('/getAllUsersDetails',auth,getAllUsersDetails);

// all about enrolled courses
router.get('/getEnrolledCourses',auth,getEnrolledCourses);
router.put('/updateDisplayPicture',auth,updateDisplayPicture);

module.exports = router;