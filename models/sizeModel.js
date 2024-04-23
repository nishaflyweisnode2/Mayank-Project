const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['Small', 'Medium', 'Large']
    },
    status: {
        type: String,
        default: false
    }
});

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size;
