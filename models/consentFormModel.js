const mongoose = require('mongoose');

const consentFormSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const ConsentForm = mongoose.model('ConsentForm', consentFormSchema);

module.exports = ConsentForm;
