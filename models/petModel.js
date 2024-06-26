const mongoose = require('mongoose');
const schema = mongoose.Schema;

const petSchema = new mongoose.Schema({
    user: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    petName: {
        type: String,
    },
    mainCategory: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    breed: {
        type: schema.Types.ObjectId,
        ref: "Breed",
    },
    size: {
        type: schema.Types.ObjectId,
        ref: 'Size'
    },
    image: {
        type: String,
    },
    age: {
        type: Number,
    },
    gender: {
        type: String,
    }
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
