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
        enum: ['Small', 'Medium', 'Large']
    },
    breedAggressive: {
        type: String,
        enum: ['Non-Aggressive', 'Moderately Aggressive', 'Highly Aggressive']
    },
    status: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['Cat', 'Dog']
    },
}, { timestamps: true });

const Breed = mongoose.model('Breed', breedSchema);

module.exports = Breed;