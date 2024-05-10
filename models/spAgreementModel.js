const mongoose = require('mongoose');

const spAgreementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    agreementDocument: {
        type: String,
    },
}, { timestamps: true });

const SPAgreement = mongoose.model('SPAgreement', spAgreementSchema);

module.exports = SPAgreement;
