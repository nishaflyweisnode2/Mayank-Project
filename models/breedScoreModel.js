const mongoose = require('mongoose');
const { Schema } = mongoose;


const breedScoreSchema = new mongoose.Schema({
    breedSize: {
        type: Schema.Types.ObjectId,
        ref: 'Size',
    },
    score: {
        type: Number,
        min: -2,
        max: 1
    }
}, { timestamps: true });

const BreedScore = mongoose.model('BreedScore', breedScoreSchema);

module.exports = BreedScore;
