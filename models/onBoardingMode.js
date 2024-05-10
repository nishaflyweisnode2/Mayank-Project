const mongoose = require('mongoose');

const spAgreementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    policeVerification: {
        type: String,
    },
    isPoliceVerificationUpload: {
        type: Boolean,
        default: false
    },
    certificateDocument: [
        {
            img: { type: String }
        }
    ],
    isCertificateDocumentUpload: {
        type: Boolean,
        default: false
    },
    aadharOtp: {
        type: String,
    },
    aadharNumber: {
        type: String,
    },
    aadharFrontImage: {
        type: String,
    },
    aadharBackImage: {
        type: String,
    },
    isAadharCardUpload: {
        type: Boolean,
        default: false
    },
    panNumber: {
        type: String,
    },
    panCardImage: {
        type: String,
    },
    isPanCardUpload: {
        type: Boolean,
        default: false
    },
    addressProof: {
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        yourAddress: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        pincode: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        },
        alternateMobileNumber: {
            type: String,
        },
        officeAddressProof: {
            type: String,
        },
        electricBillProof: {
            type: String,
        },
        isUploadAddress: {
            type: Boolean,
            default: false,
        },
    },
    bankDetails: {
        bankName: {
            type: String,
        },
        accountNumber: {
            type: String,
        },
        reAccountNumber: {
            type: String,
        },
        accountHolderName: {
            type: String,
        },
        ifscCode: {
            type: String,
        },
        cheque: {
            type: String,
        },
        isUploadbankDetails: {
            type: Boolean,
            default: false,
        },
    },
}, { timestamps: true });

const SPAgreement = mongoose.model('OnboardingDetails', spAgreementSchema);

module.exports = SPAgreement;
