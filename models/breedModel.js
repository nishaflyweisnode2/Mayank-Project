const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    status: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Breed = mongoose.model('Breed', breedSchema);

module.exports = Breed;