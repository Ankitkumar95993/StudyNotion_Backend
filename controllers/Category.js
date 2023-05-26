const Category = require("../models/Category");
const Course = require("../models/Course");

//create category ka handler function

exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;
    //validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "all fields are mandatory to be field",
      });
    }
    //create entry in db
    const tagDetails = Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails);
    return res.status(200).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    return res.status(500).josn({
      success: false,
      message: error.message,
    });
  }
};

// get All category

exports.showAllCAtegory = async (req, res) => {
  try {
    const allCategory = await Tag.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "All Category returned successfully",
      allCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Category page details

exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const { categoryId } = req.body;
    //get course for specified category if
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    // validation if courses are present or not
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
    //get course for different categories

    const differentCategories = await Category.findById({
      _id: { $ne: categoryId },
    })
    .populate("courses")
    .exec();

    // get top courses    //HW
    const topCourse = await Course.findById(courseId)
    const bestSellingCourses = await Course.find
    

    //return response
    return res.status(200).json({
       success:true,
       data:selectedCategory,
              differentCategories,
                bestSellingCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
       success:false,
       message:error.message,
    });

  }
};
