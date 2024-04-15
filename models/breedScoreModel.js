const mongoose = require('mongoose');

const breedScoreSchema = new mongoose.Schema({
    breedSize: {
        type: String,
        enum: ['Small', 'Medium', 'Large', 'Extra-Large']
    },
    score: {
        type: Number,
        min: -2,
        max: 1
    }
}, { timestamps: true });

const BreedScore = mongoose.model('BreedScore', breedScoreSchema);

module.exports = BreedScore;
