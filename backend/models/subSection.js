const mongoose = require('mongoose');

const subSectionSchema = new mongoose.Schema({
    title: {
        type: String
    },
    timeDuration: {
        type: String
    },
    description: {
        type: String
    },
    videoUrl: {
        type: String
    },
    codeStreamUrl: {
        type: String // A URL to a JSON file containing the Yjs updates
    },
    initialCode: {
        type: String // Optional: the initial script content when the video starts
    }

});

module.exports = mongoose.model('SubSection', subSectionSchema) 