const express = require('express');
const router = express.Router();


const {verifySignature, capturePayment} = require('../controllers/Payments');
const {auth,isStudent,isInstructor,isAdmin} = require('../middlwares/auth')
router.post("/capturePayment",auth,isStudent,capturePayment);
router.post("/verifySignature",verifySignature);

module.exports = router;