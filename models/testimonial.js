const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testimonialSchema = new Schema(
    {
        mainCategoryId: {
            type: Schema.Types.ObjectId,
            ref: "mainCategory"
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        image: {
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);