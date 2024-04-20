const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartSchema = new Schema({
        userId: {
                type: Schema.Types.ObjectId,
                ref: 'user',
                required: true,
        },
        coupanId: {
                type: Schema.Types.ObjectId,
                ref: 'coupons',
        },
        offerId: {
                type: Schema.Types.ObjectId,
                ref: 'offer',
        },
        freeService: [
                {
                        freeServiceId: {
                                type: Schema.Types.ObjectId,
                                ref: 'freeService',
                        },
                },
        ],
        Charges: [
                {
                        chargeId: {
                                type: Schema.Types.ObjectId,
                                ref: 'Charges',
                        },
                        charge: {
                                type: Number,
                                default: 0,
                        },
                        discountCharge: {
                                type: Number,
                                default: 0,
                        },
                        discount: {
                                type: Boolean,
                                default: false,
                        },
                        cancelation: {
                                type: Boolean,
                                default: false,
                        },
                },
        ],
        tipProvided: {
                type: Number,
                default: 0,
        },
        tip: {
                type: Boolean,
                default: false,
        },
        freeServiceUsed: {
                type: Boolean,
                default: false,
        },
        coupanUsed: {
                type: Boolean,
                default: false,
        },
        offerUsed: {
                type: Boolean,
                default: false,
        },
        walletUsed: {
                type: Boolean,
                default: false,
        },
        wallet: {
                type: Number,
                default: 0,
        },
        offer: {
                type: Number,
                default: 0,
        },
        coupan: {
                type: Number,
                default: 0,
        },
        freeServiceCount: {
                type: Number,
                default: 0,
        },
        suggestion: {
                type: String,
        },
        houseFlat: {
                type: String,
        },
        appartment: {
                type: String,
        },
        landMark: {
                type: String,
        },
        houseType: {
                type: String,
                enum: ['home', 'Other'],
        },
        Date: {
                type: Date,
        },
        startTime: {
                type: String,
        },
        endTime: {
                type: String,
        },
        services: [
                {
                        serviceId: {
                                type: Schema.Types.ObjectId,
                                ref: 'Service',
                        },
                        price: {
                                type: Number,
                        },
                        quantity: {
                                type: Number,
                                default: 1,
                        },
                        total: {
                                type: Number,
                                default: 0,
                        },
                },
        ],
        addOnServices: [{
                serviceId: {
                        type: Schema.Types.ObjectId,
                        ref: 'Service',
                },
                price: {
                        type: Number,
                },
                quantity: {
                        type: Number,
                        default: 1,
                },
                total: {
                        type: Number,
                        default: 0,
                },

        }],
        packages: [
                {
                        packageId: {
                                type: Schema.Types.ObjectId,
                                ref: 'Package',
                        },
                        packageType: {
                                type: String,
                                enum: ['Essential', 'Standard', 'Pro']
                        },
                        services: [{
                                serviceId: {
                                        type: Schema.Types.ObjectId,
                                        ref: 'Service',
                                },
                                selectedCount: { type: Number, default: 0 },
                                selected: { type: Boolean, default: false },
                                quantity: {
                                        type: Number,
                                        default: 1,
                                },
                        }],
                        price: {
                                type: Number,
                        },
                        quantity: {
                                type: Number,
                                default: 1,
                        },
                        total: {
                                type: Number,
                                default: 0,
                        },
                },
        ],
        totalAmount: {
                type: Number,
                default: 0,
        },
        additionalFee: {
                type: Number,
                default: 0,
        },
        paidAmount: {
                type: Number,
                default: 0,
        },
        totalItem: {
                type: Number,
                default: 0
        },
        breed: {
                type: Schema.Types.ObjectId,
                ref: 'Breed',
        },
        pets: {
                type: Schema.Types.ObjectId,
                ref: 'Pets',
        },
}, { timestamps: true });

module.exports = mongoose.model('cart', CartSchema);

