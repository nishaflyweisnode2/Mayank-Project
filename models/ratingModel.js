const mongoose = require("mongoose");
const schema = mongoose.Schema;
const ratingSchema = new mongoose.Schema(
    {
        userId: {
            type: schema.Types.ObjectId,
            ref: "user",
        },
        partnerId: {
            type: schema.Types.ObjectId,
            ref: "user",
        },
        orderId: {
            type: schema.Types.ObjectId,
            ref: "order"
        },
        categoryId: {
            type: schema.Types.ObjectId,
            ref: "Category"
        },
        mainCategory: {
            type: schema.Types.ObjectId,
            ref: "mainCategory"
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        rating: [{
            userId: {
                type: schema.Types.ObjectId,
                ref: "user",
            },
            rating: {
                type: Number,
                max: [5, 'too many arguments']
            },
            comment: {
                type: String,
            },
            date: {
                type: Date,
            },
            reply: [{
                userId: {
                    type: schema.Types.ObjectId,
                    ref: "user",
                },
                comment: {
                    type: String,
                },
            }]
        }],
        rating1: {
            type: Number,
            default: 0
        },
        rating2: {
            type: Number,
            default: 0
        },
        rating3: {
            type: Number,
            default: 0
        },
        rating4: {
            type: Number,
            default: 0
        },
        rating5: {
            type: Number,
            default: 0
        },
        month: {
            type: String,
        },
        averageRating: {
            type: Number,
            default: 0
        },
        totalRating: {
            type: Number,
            default: 0
        },
        type: String,
        enum: ["order", "mainCategory"],
    },
    { timestamps: true }
);
module.exports = mongoose.model("rating", ratingSchema);