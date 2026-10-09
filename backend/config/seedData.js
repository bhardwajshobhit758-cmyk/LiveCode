const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Profile = require('../models/profile');
const User = require('../models/user');
const Category = require('../models/category');
const Section = require('../models/section');
const SubSection = require('../models/subSection');
const Course = require('../models/course');
const RatingAndReview = require('../models/ratingAndReview');
const CourseProgress = require('../models/courseProgress');

function convertEjson(val) {
    if (!val || typeof val !== 'object') return val;
    if (val.$oid) return new mongoose.Types.ObjectId(val.$oid);
    if (val.$date) return new Date(val.$date);
    if (Array.isArray(val)) return val.map(convertEjson);
    const result = {};
    for (const key of Object.keys(val)) {
        result[key] = convertEjson(val[key]);
    }
    return result;
}

function loadJson(filename) {
    const filePath = path.join(__dirname, '../../mongodb-sample-data', filename);
    if (!fs.existsSync(filePath)) return [];
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return convertEjson(raw);
}

async function seedDatabase() {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Database already has data. Skipping seed.');
            return;
        }

        console.log('Seeding sample data into MongoDB...');

        const profiles = loadJson('profiles.json');
        if (profiles.length) await Profile.insertMany(profiles);

        const defaultHashedPassword = await bcrypt.hash('123456', 10);
        const users = loadJson('users.json').map(u => ({
            ...u,
            password: defaultHashedPassword // Default password for sample accounts: 123456
        }));
        if (users.length) await User.insertMany(users);

        const categories = loadJson('categories.json');
        if (categories.length) await Category.insertMany(categories);

        const subSections = loadJson('subsections.json');
        if (subSections.length) await SubSection.insertMany(subSections);

        const sections = loadJson('sections.json');
        if (sections.length) await Section.insertMany(sections);

        const courses = loadJson('courses.json');
        if (courses.length) await Course.insertMany(courses);

        const ratingAndReviews = loadJson('ratingandreviews.json');
        if (ratingAndReviews.length) await RatingAndReview.insertMany(ratingAndReviews);

        const courseProgresses = loadJson('courseprogresses.json');
        if (courseProgresses.length) await CourseProgress.insertMany(courseProgresses);

        console.log('Database seeded successfully! (Sample users password is: 123456)');
    } catch (err) {
        console.error('Error seeding sample data:', err.message);
    }
}

module.exports = { seedDatabase };
