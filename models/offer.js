const mongoose = require("mongoose");
const schema = mongoose.Schema;
const FeedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "user"
        },
        categoryId: {
            type: schema.Types.ObjectId,
            ref: "mainCategory"
        },
        serviceId: {
            type: schema.Types.ObjectId,
            ref: "services"
        },
        user: [{
            type: schema.Types.ObjectId,
            ref: "user"
        }],
        couponCode: {
            type: String,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        color: {
            type: String,
        },
        amount: {
            type: Number,
        },
        expirationDate: {
            type: Date,
        },
        activationDate: {
            type: Date,
        },
        image: {
            type: String,
        },
        type: {
            type: String,
            enum: ["user", "other"]
        },
        status: {
            type: Boolean,
            default: false,
        },
    },
    { timeseries: true }
);
module.exports = mongoose.model("offer", FeedbackSchema);