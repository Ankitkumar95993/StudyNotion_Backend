const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "all fields are mandatory to  filled",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section object id
    const updateCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      { $push: { courseContent: newSection._id } },
      // Hw : use populate to replace section / sub-section both in updatecourseDetails
      { new: true }
    ).populate("");
    //return response
    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      updateCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to create section",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //fetch data
    const { sectionName, sectionId } = req.body;
    //data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }
    //update data
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to update section",
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //get id - assumming we are sending id in params
    const { sectionId } = req.params;
    //use find by id and del
    await Section.findByIdAndDelete(sectionId);
    // do we need to delete the entry from the course Schema??
    // return response
    return res.status(200).json({
      success: true,
      message: "section deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "unable to delete section",
    });
  }
};
