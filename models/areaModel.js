const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },

});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
