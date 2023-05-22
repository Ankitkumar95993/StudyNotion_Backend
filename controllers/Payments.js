const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiate the razorpay order

exports.capturePayment = async (req, res) => {
  //get course id and user id
  const { course_id } = req.body;
  const userId = req.user.id;
  //validation
  // valid course id
  if (!course_id) {
    return res.json({
      success: false,
      message: "Please provide valid course id",
    });
  }
  // valid courseDetials
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "Could not find the course",
      });
    }
    //user already pay for the same course
    const uid = new mongoose.Schema.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(500).json({
        success: false,
        message: "student already enrolled",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
  //order create

  const amount = course.price;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString(),
    notes: {
      userId,
      courseId: course_id,
    },
  };

  try {
    // initiate the payment using razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse._id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "could not initiate orders",
    });
  }
};

//verify signature of Razorpay and Server

exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";

  const signature = req.headers("x-razorpay-signature");

  const shasum = crypto.createHman("sha256,webhookSigret");
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is Authorised");

    const { userId, courseId } = req.body.payment.payload.entity.notes;

    try {
      //fulfill the action
      // find the course and enroll the student in it

      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "course not found",
        });
      }
      console.log(enrolledCourse);

      //find the student and add the course to their list enrolled courses me
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: User },
        { $push: { courses: courseId } },
        { new: true }
      );
      console.log(enrolledStudent);

      // confirmation wala mail send krna hai
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Conformation from codehelp",
        "Congratulation, you are onboarded into codehelp course"
      );
      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "signature verified and Course Added",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  else{
    return res.status(500).json({
        success:false,
        message:'invalid request',
    })
  }


};
