const mongoose = require("mongoose");
const schema = mongoose.Schema;
const faqSchema = new mongoose.Schema(
    {
        mainCategoryId: {
            type: schema.Types.ObjectId,
            ref: "mainCategory"
        },
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["MainCategory", "Support"],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("FAQ", faqSchema);