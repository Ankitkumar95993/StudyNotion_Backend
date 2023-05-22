const { response } = require("express");
const Profile = require("../models/Profile");
const User = require("../models/User");

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
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    //update profile

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;
    await profileDetails.save();

    //return response
    return res.status(200).json({
      success: true,
      message: "Profile details uploaded successfully",
      profileDetails,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "something went wrong, cant update profile",
    });
  }
};

// delete Account

exports.deleteAccount = async (req, req) => {
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
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
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
        const userDetails = await User.findById(id).populate("addtionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:"User details fetched successfully",
        });

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'Can not fetched user details',
        });

    }
}
