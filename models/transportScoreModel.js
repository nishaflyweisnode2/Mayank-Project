const mongoose = require('mongoose');

const transportScoreSchema = new mongoose.Schema({
    modeOfTransport: {
        type: String,
        enum: ['Walking', 'Bicycle', '2 Wheeler']
    },
    distanceRange_0_1_Kms: {
        type: Number,
        default: 0
    },
    distanceRange_1_5_Kms: {
        type: Number,
        default: 0
    },
    distanceRange_5_10_Kms: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const TransportScore = mongoose.model('TransportScore', transportScoreSchema);

module.exports = TransportScore;
