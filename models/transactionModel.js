const mongoose = require("mongoose");
const schema = mongoose.Schema;

const transactionSchema = mongoose.Schema({
    user: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    // orderId: {
    //     type: schema.Types.ObjectId,
    //     ref: "order",
    // },
    // subscriptionId: {
    //     type: schema.Types.ObjectId,
    //     ref: "subscription",
    // },
    date: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
    },
    month: {
        type: String,
    },
    paymentMode: {
        type: String,
    },
    type: {
        type: String,
    },
    Status: {
        type: String,
    },
}, { timestamps: true });

const transaction = mongoose.model("transaction", transactionSchema);
module.exports = transaction;
