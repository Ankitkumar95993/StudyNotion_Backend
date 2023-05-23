const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

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
        success:true,
        message:'Rating and Review created successfully',
        ratingReview,
    })
  } catch (error) {
    console.log(error);
    return res.status(403).json({
        success:false,
        message:error.message,
    });
  }
};

// getAverageRating

//getAllRating
