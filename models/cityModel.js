const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true
    },
});


const City = mongoose.model('City', citySchema);

module.exports = City;
