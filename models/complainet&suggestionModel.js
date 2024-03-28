const mongoose = require('mongoose');

const complaintSuggestionSchema = new mongoose.Schema({
    complaint: {
        type: String,
    },
    suggestion: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ComplaintSuggestion = mongoose.model('ComplaintSuggestion', complaintSuggestionSchema);

module.exports = ComplaintSuggestion;
