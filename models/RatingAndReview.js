
const mongoose = require('mongoose');

const ratingAndReview = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User",
        },
        rating:{
            type:Number,
            required:true,
        },
        reviews:{
            type:String,
            required:true,
        },
        course:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Course",
        }
       
    });

module.exports = mongoose.model("RatingAndReview",ratingAndReview);
