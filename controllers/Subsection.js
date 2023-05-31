const Section = require("../models/Section");
const { uploadImageToCludinary } = require("../utils/imageUploader");
const SubSection = require("../models/SubSection");

// create Subsection ka logic
exports.createSubsection = async (req, res) => {
  try {
    // fetch data from req body
    const { title, description, sectionId, timeDuration } = req.body;
    // fetch file form file body i.e extract file/video
    const video = req.files.videoFile;
    // validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
        p,
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCludinary(
      video.process.env.FOLDER_NAME
    );
    // create a subsection
    const subSectionDetails = SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    // update section with this subsection object id

    const updateSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: subSectionDetails._id } },
      { new: true }
    );
    // HW : log updated section here, after adding popupate query
    // return response
    return res.status(200).json({
      success: true,
      message: "subsection created successfully",
      updateSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

// HW update subsection

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body
    const subSection = await SubSection.findById(sectionId)

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      })
    }

    if (title !== undefined) {
      subSection.title = title
    }

    if (description !== undefined) {
      subSection.description = description
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      )
      subSection.videoUrl = uploadDetails.secure_url
      subSection.timeDuration = `${uploadDetails.duration}`
    }

    await subSection.save()

    return res.json({
      success: true,
      message: "Section updated successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the section",
    })
  }
}
// HW delete subsection

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      }
    )
    const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" })
    }

    return res.json({
      success: true,
      message: "SubSection deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the SubSection",
    })
  }
}
