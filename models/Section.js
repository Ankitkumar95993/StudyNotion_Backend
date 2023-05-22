
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
    {
        sectionName:{
            type:String,
        },
        subSection:[{
            type:mongoose.Schema.Types.ObjectId,
        }]
    });

module.exports = mongoose.model("Section",sectionSchema);
