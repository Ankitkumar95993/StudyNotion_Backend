const { response } = require("express");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// update profile
exports.updateProfile = async (req, res) => {
  try {
    //Get data
    const { about = "", contactNumber, gender, dateOfBirth = "" } = req.body;
    //get user id
    const id = req.user.id;
    //validate kro
    if (!contactNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //find profile
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);
    

    //update profile

    profile.dateOfBirth = dateOfBirth;
    profile.about = about;
    profile.gender = gender;
    profile.contactNumber = contactNumber;

    await profile.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile details uploaded successfully",
      profile,
    });
  } catch(error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong, cant update profile",
    });
  }
};

// delete Account

exports.deleteAccount = async(req,res) => {
  try {
    // get id
    const id = req.user.id;
    // validation
    const userDetails = User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "cant find the user",
      });
    }
    // delete profile
    await Profile.findByIdAndDelete({ _id:userDetails.additionalDetails });
    // delete user
    await User.findByIdAndDelete({ _id: id });
    //HW : how can we schedule so the instantly it should not be deleted
    // find cron job

    // HW : enrolled user
    // return response
    return res.status(200).json({
      success: true,
      message: "user account delete successfully",
    });
  } catch {
    return res.status(404).json({
      success: false,
      message: "user account cannot be deleted successfully",
    });
  }
};

//get All users


exports.getAllUsersDetails=async(req,res)=>{
    try{
        //get id;
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"User details fetched successfully",
            data:userDetails,
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'error.message',
        });

    }
}


exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'cant upload to cloudinary',
    })
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec()
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
};