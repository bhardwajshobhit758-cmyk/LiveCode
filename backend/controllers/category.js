const Category = require('../models/category')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')

const getSampleCategories = () => {
    try {
        const sampleDataPath = path.join(__dirname, '../../mongodb-sample-data/categories.json');
        if (fs.existsSync(sampleDataPath)) {
            const raw = JSON.parse(fs.readFileSync(sampleDataPath, 'utf-8'));
            return raw.map(cat => ({
                _id: cat._id?.$oid || cat._id,
                name: cat.name,
                description: cat.description,
                courses: (cat.courses || []).map(c => c?.$oid || c)
            }));
        }
    } catch (e) {
        console.error('Error reading sample categories:', e.message);
    }
    return [];
};

// get Random Integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// ================ create Category ================
exports.createCategory = async (req, res) => {
    try {
        // extract data
        const { name, description } = req.body;

        // validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const categoryDetails = await Category.create({
            name: name, description: description
        });

        res.status(200).json({
            success: true,
            message: 'Category created successfully'
        });
    }
    catch (error) {
        console.log('Error while creating Category');
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error while creating Category',
            error: error.message
        })
    }
}


// ================ get All Category ================
exports.showAllCategories = async (req, res) => {
    try {
        let allCategories = [];
        if (mongoose.connection.readyState === 1) {
            allCategories = await Category.find({}, { name: true, description: true });
        }
        if (!allCategories || allCategories.length === 0) {
            allCategories = getSampleCategories();
        }

        // return response
        res.status(200).json({
            success: true,
            data: allCategories,
            message: 'All categories fetched successfully'
        })
    }
    catch (error) {
        console.log('Error while fetching all allCategories, returning sample categories:', error.message);
        res.status(200).json({
            success: true,
            data: getSampleCategories(),
            message: 'Categories fetched successfully (sample data)'
        })
    }
}



// ================ Get Category Page Details ================
exports.getCategoryPageDetails = async (req, res) => {
    try {
        const { categoryId } = req.body
        // console.log("PRINTING CATEGORY ID: ", categoryId);

        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        // console.log('selectedCategory = ', selectedCategory)
        // Handle the case when the category is not found
        if (!selectedCategory) {
            // console.log("Category not found.")
            return res.status(404).json({ success: false, message: "Category not found" })
        }



        // Handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            console.log("No courses found for the selected category.")
            // return res.status(404).json({
            //     success: false,
            //     data: null,
            //     message: "No courses found for the selected category.",
            // })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })

        let differentCategory = null;
        if (categoriesExceptSelected && categoriesExceptSelected.length > 0) {
            const randomCat = categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)];
            if (randomCat && randomCat._id) {
                differentCategory = await Category.findOne(randomCat._id)
                    .populate({
                        path: "courses",
                        match: { status: "Published" },
                    })
                    .exec();
            }
        }

        //console.log("Different COURSE", differentCategory)
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()

        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)

        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}