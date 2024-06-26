const mongoose = require("mongoose");
const schema = mongoose.Schema;
var userSchema = new schema(
    {
        serviceCategoryId: [{ type: mongoose.Schema.ObjectId, ref: 'mainCategory' }],
        categoryId: { type: mongoose.Schema.ObjectId, ref: 'Category' },
        vendorId: { type: schema.Types.ObjectId, ref: "user" },
        subscriptionId: { type: mongoose.Schema.ObjectId, ref: "subscription", },
        booking: { type: Number },
        refferalCode: { type: String, },
        refferUserId: { type: schema.Types.ObjectId, ref: "user" },
        joinUser: [{ type: schema.Types.ObjectId, ref: "user" }],
        fullName: {
            type: String,
        },
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        language: {
            type: String,
        },
        image: {
            type: String,
        },
        gender: {
            type: String,
        },
        dob: {
            type: String,
        },
        phone: {
            type: String,
        },
        alternatePhone: {
            type: String,
        },
        email: {
            type: String,
            minLength: 10,
        },
        password: {
            type: String,
        },
        address1: {
            type: String,
        },
        address2: {
            type: String,
        },
        panCard: {
            type: String,
        },
        aadharCard: {
            type: String,
        },
        otherDocument: {
            type: String,
        },
        otherImage: {
            type: String,
        },
        documentVerification: {
            type: Boolean,
            default: false,
        },
        city: { type: mongoose.Schema.ObjectId, ref: 'City' },
        isCity: {
            type: String,
            default: false
        },
        sector: { type: mongoose.Schema.ObjectId, ref: 'Area' },
        isSector: {
            type: String,
            default: false
        },
        km: {
            type: Number,
            default: 0,
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        district: {
            type: String,
        },
        pincode: {
            type: Number,
        },
        otp: {
            type: String,
        },
        otpExpiration: {
            type: String,
        },
        accountVerification: {
            type: Boolean,
            default: false,
        },
        completeProfile: {
            type: Boolean,
            default: false,
        },
        userType: {
            type: String,
            enum: ["USER", "PARTNER", "ADMIN"],
        },
        status: {
            type: String,
            enum: ["Approved", "Reject", "Pending"],
        },
        currentLocation: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            },
        },
        workcity: {
            type: String
        },
        mainHub: {
            type: String
        },
        secondaryHub: {
            type: String
        },
        averageRating: {
            type: Number,
            default: 0
        },
        openClose: {
            type: String,
            enum: ["OPEN", "Close"],
            default: "OPEN"
        },
        storeLocation: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            },
        },
        Monday: {
            type: String
        },
        Tuesday: {
            type: String
        },
        Wednesday: {
            type: String
        },
        Thursday: {
            type: String
        },
        Friday: {
            type: String
        },
        Saturday: {
            type: String
        },
        Sunday: {
            type: String
        },
        wallet: {
            type: Number,
            default: 0,
        },
        serviceName: {
            type: String
        },
        servieImages: {
            type: Array
        },
        occupation: [{ type: mongoose.Schema.ObjectId, ref: 'mainCategory' }],
        //Work Experience
        year: {
            type: String
        },
        month: {
            type: String
        },
        role: [{ type: mongoose.Schema.ObjectId, ref: 'mainCategory' }],
        lockScreenPassword: {
            type: String,
            default: null
        },
        isLockScreenPassword: {
            type: Boolean,
            default: false
        },
        currentRole: {
            type: mongoose.Schema.ObjectId,
            ref: 'mainCategory'
        },
        providerCode: { type: String, },
        qrCodePath: { type: String, },
        transportation: {
            type: String,
            enum: ['Walking', 'Bicycle', '2 Wheeler'],
        }
    },
    { timestamps: true }
);
module.exports = mongoose.model("user", userSchema);
