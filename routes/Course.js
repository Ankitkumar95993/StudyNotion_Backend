const express = require('express');
const router = express.Router();

// course  import
const {createCourse, showAllCourses, getCourseDetails} = require('../controllers/Course');

// category import
const {createCategory,showAllCategory,categoryPageDetails} = require('../controllers/Category');

//section import
const{createSection,deleteSection, updateSection} = require('../controllers/Section');

//sebsection import
const{createSubsection, updateSubSection,deleteSubSection} = require('../controllers/Subsection');

//Rating import
const{createRating,getAverageRating,getAllRatingReviews} = require('../controllers/RatingAndReview');

//middleware import
const{auth,isAdmin,isStudent,isInstructor} = require('../middlwares/auth');

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

//course creation
router.post('/createCourse',auth,isInstructor,createCourse);

//add section to course 
router.post('/createSection',auth,isInstructor,createSection);

//update section in course
router.put("/updateSection",auth,isInstructor,updateSection);

//delete  section in course
router.delete('/deleteSection',auth,isInstructor,deleteSection);

//add subsection to course
router.post('/createSubSection',auth,isInstructor,createSubsection);

//update subsection in course
router.put('/updateSubSection',auth,isInstructor,updateSubSection);

//delete Subsection in course
router.delete('/detelSubSection',auth,isInstructor,deleteSubSection);

//get details of all course
router.get('/getAllCourse',showAllCourses)

//get details of specific course
router.post('/getAllCourseDetails',getCourseDetails);

// ********************************************************************************************************
//                                      Category routes (Only by Admin)
// ********************************************************************************************************

// category only be created by admin
// TODO : add isAdmin middleware here

router.post('/createCategory',auth,isAdmin,createCategory);
// router.get('/showAllCategory',showAllCategory);
router.post('/CategoryPageDetails',categoryPageDetails);

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************

router.post("/createRating", auth, isStudent, createRating);
router.get("getAverageRating",getAverageRating);
router.get("getReviews",getAllRatingReviews);
