const mongoose = require('mongoose');
const { Schema } = mongoose;

const slotSchema = new Schema({
    mainCategory: {
        type: Schema.Types.ObjectId,
        ref: 'mainCategory',
    },
    dateFrom: {
        type: Date,
    },
    dateTo: {
        type: Date,
    },
    timeFrom: {
        type: String,
    },
    timeTo: {
        type: String,
    },
    selectDuration: {
        type: String,
        enum: ['15', '20', '30', '45', '60']
    },
    jobAcceptance: {
        type: Number,
    },
    totalBookedUsers: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: false,
    },
    surgeAmount: {
        type: Number,
        default: 0,
    },
    isSurgeAmount: {
        type: Boolean,
        default: false,
    },
});

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
