const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueReportSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'order',
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
    },
    issueType: {
        type: String,
        enum: ['Issue with Service Quality', 'Issue with Products', 'Expert Behavior Issue', 'Hygiene Isuue', 'Issue with Payment', 'Other'],
    },
    description: {
        type: String,
    },
    ticketID: {
        type: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('IssueReport', IssueReportSchema);
