const mongoose = require('mongoose');

const transportationChargesSchema = new mongoose.Schema({
    amount: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    attachFile: {
        type: String,
        required: true
    }
}, { timestamps: true });

const TransportationCharges = mongoose.model('TransportationCharges', transportationChargesSchema);

module.exports = TransportationCharges;
