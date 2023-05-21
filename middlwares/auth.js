
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');


//auth
exports.auth = async(req,res,next)=>{
    try{

        //extract token 
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");
        // if token is missing
        if(!token)
        {
            return res.status(401).json({
                success:false,
                message:"token is missing",
            })
        }
    // verify the token

     try{
         const decode =  jwt.verify(token, process.env.JET_SECRET);
         console.log(decode);
         req.user = decode;

     }catch(err){
        // verification issue
        return res.status(401).json({
            success:false,
            message:"token is invalid",
        });
     }
     next();
    }
    
    catch(error){
       return res.status(401).json({
        success:false,
        message:"something went wrong while validating the token",
       });

    }

}



// isStudent

exports.isStudent = async(req,res,next)=>{
    try{
         //we bring the role option from the payload also, bur here we will try another process
         if(req.user.accountType !== "Student")
         {
            return res.status(401).json({
                success:false,
                message:"This is protected rotute for student only",
            });
         }

       next();

    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can't be verified, please try again",
        })

    }
}




// isInstructor

exports.isInstructor = async(req,res,next)=>{
    try{
         //we bring the role option from the payload also, bur here we will try another process
         if(req.user.accountType !== "Instructor")
         {
            return res.status(401).json({
                success:false,
                message:"This is protected rotute for instructor only",
            });
         }

       next();

    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can't be verified, please try again",
        })

    }
}




// isAdmin

exports.isAdmin = async(req,res,next)=>{
    try{
         //we bring the role option from the payload also, bur here we will try another process
         if(req.user.accountType !== "Admin")
         {
            return res.status(401).json({
                success:false,
                message:"This is protected rotute for Admin only",
            });
         }

       next();

    }

    catch(error){
        return res.status(500).json({
            success:false,
            message:"User role can't be verified, please try again",
        })

    }
}




