const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ApprovalRequest = mongoose.model('ApprovalRequest', approvalRequestSchema);

module.exports = ApprovalRequest;
