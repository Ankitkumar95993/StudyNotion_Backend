const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating

exports.createRating = async (req, res) => {
  try {
    //get userID
    const { userId } = req.user.id;
    //fetch data from req body
    const { rating, review, courseId } = req.body;
    // check user is enroller or not
    const courseDetials = await Course.findOne({
      _id: userId,
      studentEnrolle: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetials) {
      return res.status(404).json({
        success: true,
        message: "Student is not enrolled in the course",
      });
    }
    // check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      _id: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }
    //create review

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    // update course with this rating and review
    await Course.findByIdAndUpdate(
      courseId,
      {
        $push: { RatingAndReviews: ratingReview._id },
      },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

// getAverageRating

exports.getAverageRating = async (req, res) => {
  try {
    //get courseId
    const courseId = req.body.courseId;
    //calculate avg rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Schema.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "rating" },
        },
      },
    ]);
    //return response
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }

    // if no review rating exist
    return res.status(200).json({
      success: true,
      message: "Average rating is zero, no rating given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      success: false,
      message: error.message,
    });
  }
};

//get All Rating and reviews

exports.getAllRatingReviews = async (req, res) => {
  try {
    const allReview = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName,lastName,email,image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All review fetched successfully",
      data: allReview,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        success:false,
        message:error.message,
    });
  }
};
