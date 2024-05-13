const mongoose = require('mongoose');


const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    referredName: {
        type: String,
        required: true
    },
    referredMobile: {
        type: String,
        required: true
    },
    referredOccupation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'mainCategory',
    }],
    referredAt: {
        type: Date,
        default: Date.now
    }
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
