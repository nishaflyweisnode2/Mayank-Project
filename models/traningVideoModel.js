const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
    link: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
    }
}, { timestamps: true });

const Training = mongoose.model('TrainingVideos', trainingSchema);

module.exports = Training;
