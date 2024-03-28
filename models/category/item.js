const mongoose = require("mongoose");

const schema = mongoose.Schema;
const categorySchema = schema({
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "Category"
    },
    itemSubCategoryId: {
        type: schema.Types.ObjectId,
        ref: "itemSubCategory"
    },
    name: {
        type: String
    },
    price: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

module.exports = mongoose.model("item", categorySchema);
