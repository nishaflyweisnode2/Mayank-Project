const mongoose = require("mongoose");

const schema = mongoose.Schema;
const serviceTypeRefSchema = schema({
    service: {
        type: schema.Types.ObjectId,
        ref: "services"
    },
    serviceType: {
        type: schema.Types.ObjectId,
        ref: "ServiceType"
    },

}, { timestamps: true });

module.exports = mongoose.model("ServiceTypeRef", serviceTypeRefSchema);
