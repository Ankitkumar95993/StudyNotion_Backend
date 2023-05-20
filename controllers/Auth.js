const User = require("../models/User");

require("../models/OTP");
require("../models/User");
const otpGenerator = require('otp-generator');
const OTP = require("../models/OTP");

//send OPT

exports.sendOTP = async(req,res)=>{
    try{
        // fetch email from req ka body
        const{email} = req.body;
        
        //check user if already exist

        const checkUserPresent = await User.findOne({email});
        
        //if user already exist then return response
        if(checkUserPresent)
        {
            return res.status(401).json({
                success:false,
                message:"user already registerd",
            })
        }

        //generate OTP
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });
        console.log("otp generate" , otp);

        //check unique otp or not
        const result = await otp.findOne({otp:otp})

        while(result)
        {
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await otp.findOne({otp:otp});
        }
        

        const otpPayload =  {email, otp};


        //create entry in database
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfully

         res.status(200).json({
            success:true,
            message:'OTP sent Successfully',
            otp,
         })


    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}


//signup


exports.signUp = async(req, res)=>{

    try{

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

        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All field are compulsory"

            })
        }
        // 2 password match kro

        if(password !== confirmPassword)
         return res.status(400).json({
            success:false,
            message:"Password and Confirm Password doesn't match, please try again",
         })
        //check user already exist or not

        const existingUser = await User.findOne({email});
        if(existingUser)
        {
            return res.status(400).json({
                success:false,
                message:'user is already registerd'
            })
        }
        // find most recent OTP stored for the user

        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
            
        //validate otp

        if(recentOtp.length == 0)
        {
            
        }

        // entry create in db









    }
    catch{

    }
}








// login




//reset Password