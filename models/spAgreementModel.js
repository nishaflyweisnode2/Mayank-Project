const mongoose = require('mongoose');

const spAgreementSchema = new mongoose.Schema({
    photo: {
        type: String,
        // required: true
    },
    agreementDocument: {
        type: String,
        // required: true
    },
    mobile: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    aadharNumber: {
        type: String,
        // required: true
    },
    aadharFrontImage: {
        type: String,
        // required: true
    },
    aadharBackImage: {
        type: String,
        // required: true
    },
    panNumber: {
        type: String,
        // required: true
    },
    panCardImage: {
        type: String,
        // required: true
    }
}, { timestamps: true });

const SPAgreement = mongoose.model('SPAgreement', spAgreementSchema);

module.exports = SPAgreement;
