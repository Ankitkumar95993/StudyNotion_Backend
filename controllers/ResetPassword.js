
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

// resetPassword token

exports.resetPasswordToken = async (req,res) => {
  try {
    //req ke body se email nikal lo,
    const email = req.body.email;

    //check user exist for the user ,validation for email,
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `your email : ${email} is not registered with us`,
      });
    }
    //generate token,
    const token = crypto.randomUUID();
    //update user by adding token and expiration time,
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );
    console.log(updatedDetails);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing the url
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link:${url}`
    );
    //return response
    res.json({
      success: true,
      message:
        "email send successfully, click on the link to to change the password",
    });
  } catch(error) {
    return res.json({
      error: error.message,
      success: false,
      message: "something went wrong",
    });
  }
};

// reset password

exports.resetPassword = async (req, res) => {
  try {
    // data fetch krlo
    const { password, confirmPassword, token } = req.body;
    // validation krlo
    if (confirmPassword !== password)
      return res.json({
        success: false,
        message: "password not matched, please reenter",
      });
    // get user details from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry - invalid token
    if (!userDetails)
      return res.json({
        success: false,
        message: "Token is invalid",
      });

    //token time check

    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: "Token is expired, please regenerate token",
      });
    }

    //hash pass

    const hashedPassword = await bcrypt.hash(password, 10);
    //password updata
    await User.findOneAndUpdate(
      { token },
      { password: hashedPassword },
      { new: true }
    );
    // return response
    return res.status(200).json({
      success: true,
      message: "Password reset successfull",
    });
  } catch {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong while rwsetting your password",
    });
  }
};
