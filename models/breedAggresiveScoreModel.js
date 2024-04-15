const mongoose = require('mongoose');

const breedAggressiveScoreSchema = new mongoose.Schema({
    BreedAggressive: {
        type: String,
        enum: ['Non Aggressive', 'Moderately Aggressive', 'Highly Aggressive']
    },
    score: {
        type: Number,
    }
}, { timestamps: true });

const BreedAggressiveScore = mongoose.model('BreedAggressiveScore', breedAggressiveScoreSchema);

module.exports = BreedAggressiveScore;
