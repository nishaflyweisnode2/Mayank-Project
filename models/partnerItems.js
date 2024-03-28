const mongoose = require('mongoose');
const schema = mongoose.Schema;
const DocumentSchema = schema({
        userId: {
                type: schema.Types.ObjectId,
                ref: "user"
        },
        itemId: {
                type: schema.Types.ObjectId,
                ref: "item"
        },
        totalStock: {
                type: Number,
        },
        useStock: {
                type: Number,
                default: 0
        },
        liveStock: {
                type: Number,
                default: 1
        },
}, { timestamps: true })
module.exports = mongoose.model("partnerItems", DocumentSchema);