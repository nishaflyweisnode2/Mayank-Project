const mongoose = require("mongoose");

const schema = mongoose.Schema;
const categorySchema = schema({
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "Category"
    },
    name: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("itemSubCategory", categorySchema);
