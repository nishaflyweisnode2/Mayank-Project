const mongoose = require('mongoose');

const experienceScoreSchema = new mongoose.Schema({
    years: {
        type: Number,
    },
    yearScore: {
        type: Number,
    },
    months: {
        type: Number,
    },
    monthScore: {
        type: Number,
    }
}, { timestamps: true });

const ExperienceScore = mongoose.model('ExperienceScore', experienceScoreSchema);

module.exports = ExperienceScore;
