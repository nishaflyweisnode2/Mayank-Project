const mongoose = require("mongoose");

const schema = mongoose.Schema;
const serviceTypeSchema = schema({
    mainCategoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    name: {
        type: String
    },
    image: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("ServiceType", serviceTypeSchema);
