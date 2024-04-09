const mongoose = require('mongoose');
const schema = mongoose.Schema;


const breedSchema = new mongoose.Schema({
    mainCategory: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    size: {
        type: String,
    },
    breedAggressive: {
        type: String,
    },
    status: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Breed = mongoose.model('Breed', breedSchema);

module.exports = Breed;