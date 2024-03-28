const mongoose = require('mongoose');

const minimumCartSchema = new mongoose.Schema({
    minimumCartAmount: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

const Minimum = mongoose.model('MinimumCart', minimumCartSchema);

module.exports = Minimum;
