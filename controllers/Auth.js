const User = require("../models/User");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PassThrough } = require("nodemailer/lib/xoauth2");
const mailSender = require("../utils/mailSender");

//send OPT

exports.sendOTP = async (req, res) => {
  try {
    // fetch email from req ka body
    const { email } = req.body;

    //check user if already exist

    const checkUserPresent = await User.findOne({ email });

    //if user already exist then return response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "user already registerd",
      });
    }

    //generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("otp generate", otp);

    //check unique otp or not
    const result = await otp.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await otp.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //create entry in database
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response successfully

    res.status(200).json({
      success: true,
      message: "OTP sent Successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//signup

exports.signUp = async (req, res) => {
  try {
    //date fetch krlo
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    // validate krlo

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All field are compulsory",
      });
    }
    // 2 password match kro

    if (password !== confirmPassword)
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password doesn't match, please try again",
      });
    //check user already exist or not

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user is already registerd",
      });
    }
    // find most recent OTP stored for the user

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);

    //validate otp

    if (recentOtp.length == 0) {
      // otp not found
      return res.status(400).json({
        success: false,
        message: "otp not found",
      });
    } else if (otp !== recentOtp.otp) {
      // invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    //Hash Password

    const hashedPassword = await bcrypt.hash(password, 10);

    // entry create in db

    const profileDetials = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetials._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });

    //return response

    return res.status(200).json({
      success: true,
      message: "user is registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "User can not be registerd, please try again",
    });
  }
};

// login

exports.login = async (req, res) => {
  try {
    //get data from req ki body
    const { email, password } = req.body;
    //vaidation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are mandatory to field",
      });
    }
    //check user is registered or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user is not registered, please signUP first",
      });
    }

    //generate JWT token, after password matching

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now + 3 * 24 * 60 * 60 * 100),
        httpOnly: true,
      };

      //create cookie and send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "login failure, please try again",
    });
  }
};



//changePassword

exports.changePassword = async(req, res) => {
  try {
    // get data from the req body
    // get old Password, new password, confirm password
    const { oldPassword, newPassword, confirmPassword } = req.body;
    // validation
    if (!newPassword || !confirmPassword || !oldPassword) {
      return res.status(403).json({
        success: false,
        message: "All fields are mandatory to field",
      });
    }

    const user = User.findOne({ password:oldPassword});
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Wrong Password, please re-enter",
      });
    }

    if (newPassword !== confirmPassword) {
        return res.status(403).json({
            success:false,
            message:"Password doesn't matched",
        })
    }

    // update password in database
    const password = User.findOneAndUpdate({password:oldPassword},
        {password:newPassword},{new:true});

    // send mail password updated
    const response = await mailSender(email,"Change Password","your password has been changed")
    
    // return response
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"something went wrong, password doesn't chnaged",
    });
  }
};
