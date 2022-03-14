const mongoose = require('mongoose');
const ResumeSchema = new mongoose.Schema({
    title: {
        type: String,

    },
    description: {
        type: String,

    },
    date: {
        type: String,
        default: Date()
    }
});
const Resume = mongoose.model('Resume', ResumeSchema);
module.exports = Resume;