const mongoose = require('mongoose');

const proximityScoreSchema = new mongoose.Schema({
    distanceRange: {
        type: String,
        enum: ['0-1 Kms', '1-5 Kms', '5-10 Kms'],
    },
    score: {
        type: Number,
    }
}, { timestamps: true });

const ProximityScore = mongoose.model('ProximityScore', proximityScoreSchema);

module.exports = ProximityScore;
