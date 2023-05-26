const User = require("../models/User");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
const Profile = require('../models/Profile');
require('dotenv').config();

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
    const result = await User.findOne({ otp: otp });

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
		// Destructure fields from the request body
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
		// Check if All Details are there or not
		if (
			!firstName ||
			!lastName ||
			!email ||
			!password ||
			!confirmPassword ||
			!otp
		) {
			return res.status(403).send({
				success: false,
				message: "All Fields are required",
			});
		}
		// Check if password and confirm password match
		if (password !== confirmPassword) {
			return res.status(400).json({
				success: false,
				message:
					"Password and Confirm Password do not match. Please try again.",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists. Please sign in to continue.",
			});
		}

		// Find the most recent OTP for the email
		const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		console.log(response);
		if (response.length === 0) {
			// OTP not found for the email
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		} else if (otp !== response[0].otp) {
			// Invalid OTP
			return res.status(400).json({
				success: false,
				message: "The OTP is not valid",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);

		// Create the Additional Profile For User
		// const profileDetails = await Profile.create({
		// 	gender: null,
		// 	dateOfBirth: null,
		// 	about: null,
		// 	contactNumber: null,
		// });
		const user = await User.create({
			firstName,
			lastName,
			email,
			contactNumber,
			password: hashedPassword,
			accountType: accountType,
			approved: approved,
			additionalDetails: profileDetails._id,
			image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
		});

		return res.status(200).json({
			success: true,
			user,
			message: "User registered successfully",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "User cannot be registered. Please try again.",
		});
	}
};

// login

exports.logIn = async (req, res) => {
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
        email:user.email,
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
