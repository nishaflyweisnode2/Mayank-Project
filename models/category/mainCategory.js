const mongoose = require("mongoose");

const schema = mongoose.Schema;
const categorySchema = schema({
    name: {
        type: String
    },
    image: {
        type: String
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRating: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    notice: {
        type: String
    },
    
}, { timestamps: true });

module.exports = mongoose.model("mainCategory", categorySchema);
