const Course = require("../models/Course");
const User = require("../models/User");
const Tag = require("../models/Tags");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { findByIdAndUpdate } = require("../models/User");

// create course handler function
exports.createCourse = async (req, res) => {
  try {
    //fetch data from the req body
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !Price ||
      !Tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All field are mandatory",
      });
    }

    // check for Instructor validation
    // db call isliye kyuki instructor ko object id bhi toh add krna hai

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }

    // check given tag is valid or not
    tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "tags details not found",
      });
    }

    // upload image to cloudinary

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    //add the new course to the user Scheme of the Instructor

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: { courses: newCourse._id },
      },
      { new: true }
    );

    // update the tag schema
    await Tag.findByIdAndUpdate(
      { _id: tagDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    //return response

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
    });
  } catch (error) {
    console.error(error);
    return res.starus(403).json({
      success: false,
      message: "Error while creating course",
      error: error.message,
    });
  }
};

//getAllcourse handler function

exports.showAllCourses = async (req, res) => {
  try {
    const allCourse = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();
    return res.status(200).json({
      success: false,
      message: "Data of all courses are fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.starus(403).json({
      success: false,
      message: "Cannot find course data",
      error: error.message,
    });
  }
};

// get coursesDetails

exports.getCourseDetails = async (req, res) => {
  try {
    //get id
    const { courseId } = req.body;
    //find course details
    const courseDetials = await Course.find({ _id: courseId })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("catregory")
      .populate("ratingAnkdReview")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

      //validation

      if(!courseDetials)
      {
        return res.status(500).json({
          success:false,
          message:`can't fetch course details with ${courseId}`,
        });

      }
    // return response
     
    return res.status(200).json({
      success:true,
      message:'Course Details Fetched Successfully',
    });

    
  } catch (error) {}
};
