// const mongoose = require('mongoose');
// const schema = mongoose.Schema;
// const DocumentSchema = schema({
//         userId: {
//                 type: schema.Types.ObjectId,
//                 ref: "user"
//         },
//         coupanId: {
//                 type: schema.Types.ObjectId,
//                 ref: "coupons"
//         },
//         offerId: {
//                 type: schema.Types.ObjectId,
//                 ref: "offer"
//         },
//         freeService: [{
//                 freeServiceId: {
//                         type: schema.Types.ObjectId,
//                         ref: "freeService"
//                 }
//         }],
//         Charges: [{
//                 chargeId: {
//                         type: schema.Types.ObjectId,
//                         ref: "Charges"
//                 },
//                 charge: {
//                         type: Number,
//                         default: 0
//                 },
//                 discountCharge: {
//                         type: Number,
//                         default: 0
//                 },
//                 discount: {
//                         type: Boolean,
//                         default: false
//                 },
//                 cancelation: {
//                         type: Boolean,
//                         default: false
//                 },
//         }],
//         tipProvided: {
//                 type: Number,
//                 default: 0
//         },
//         tip: {
//                 type: Boolean,
//                 default: false
//         },
//         freeServiceUsed: {
//                 type: Boolean,
//                 default: false
//         },
//         coupanUsed: {
//                 type: Boolean,
//                 default: false
//         },
//         offerUsed: {
//                 type: Boolean,
//                 default: false
//         },
//         walletUsed: {
//                 type: Boolean,
//                 default: false
//         },
//         wallet: {
//                 type: Number,
//                 default: 0
//         },
//         offer: {
//                 type: Number,
//                 default: 0
//         },
//         coupan: {
//                 type: Number,
//                 default: 0
//         },
//         freeServiceCount: {
//                 type: Number,
//                 default: 0
//         },
//         suggestion: {
//                 type: String,
//         },
//         houseFlat: {
//                 type: String,
//         },
//         appartment: {
//                 type: String,
//         },
//         landMark: {
//                 type: String,
//         },
//         houseType: {
//                 type: String,
//                 enum: ["home", "Other"],
//         },
//         Date: {
//                 type: Date
//         },
//         startTime: {
//                 type: String
//         },
//         endTime: {
//                 type: String
//         },
//         services: [{
//                 serviceId: {
//                         type: schema.Types.ObjectId,
//                         ref: "services"
//                 },
//                 serviceType: {
//                         type: schema.Types.ObjectId,
//                         ref: "ServiceType"
//                 },
//                 categoryId: {
//                         type: schema.Types.ObjectId,
//                         ref: "Category"
//                 },
//                 services: [{
//                         service: {
//                                 type: schema.Types.ObjectId,
//                                 ref: "services"
//                         },
//                         serviceType: {
//                                 type: schema.Types.ObjectId,
//                                 ref: "ServiceType"
//                         },
//                         price: {
//                                 type: Number
//                         },
//                         quantity: {
//                                 type: Number,
//                                 default: 1
//                         },
//                         total: {
//                                 type: Number,
//                                 default: 0
//                         },
//                 }],
//                 packageServices: [{
//                         type: schema.Types.ObjectId,
//                         ref: "services"
//                 }],
//                 price: {
//                         type: Number
//                 },
//                 quantity: {
//                         type: Number,
//                         default: 1
//                 },
//                 total: {
//                         type: Number,
//                         default: 0
//                 },
//                 type: {
//                         type: String,
//                         enum: ["Service", "Package"]
//                 },
//                 packageType: {
//                         type: String,
//                         enum: ["Customise", "Normal", "Edit"]
//                 },
//         }],
//         totalAmount: {
//                 type: Number,
//                 default: 0
//         },
//         additionalFee: {
//                 type: Number,
//                 default: 0
//         },
//         paidAmount: {
//                 type: Number,
//                 default: 0
//         },
//         totalItem: {
//                 type: Number
//         }
// }, { timestamps: true })
// module.exports = mongoose.model("cart", DocumentSchema);



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
                        serviceType: {
                                type: Schema.Types.ObjectId,
                                ref: 'ServiceType',
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
        packages: [
                {
                        packageId: {
                                type: Schema.Types.ObjectId,
                                ref: 'Package',
                        },
                        packageType: {
                                type: String,
                                enum: ['Customize', 'Normal', 'Edit']
                        },
                        services: [{
                                serviceId: {
                                        type: Schema.Types.ObjectId,
                                        ref: 'Service',
                                },
                                serviceType: {
                                        type: Schema.Types.ObjectId,
                                        ref: 'ServiceType',
                                },
                                quantity: {
                                        type: Number,
                                        default: 1,
                                },
                                originalPrice: { type: Number },
                                discountActive: { type: Boolean, default: false },
                                discount: { type: Number },
                                discountPrice: { type: Number },
                                totalPrice: { type: Number },
                                selected: { type: Boolean, default: false },
                        }],
                        addOnServices: [{
                                serviceId: {
                                        type: Schema.Types.ObjectId,
                                        ref: 'Service',
                                },
                                serviceType: {
                                        type: Schema.Types.ObjectId,
                                        ref: 'ServiceType',
                                },
                                quantity: {
                                        type: Number,
                                        default: 1,
                                },
                                originalPrice: { type: Number },
                                discountActive: { type: Boolean, default: false },
                                discount: { type: Number },
                                discountPrice: { type: Number },
                                totalPrice: { type: Number },
                                selected: { type: Boolean, default: false },

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
        },
}, { timestamps: true });

module.exports = mongoose.model('cart', CartSchema);

