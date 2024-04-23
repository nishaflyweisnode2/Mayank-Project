const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const Schema = mongoose.Schema;

const packageSchema = new Schema({
    mainCategoryId: { type: Schema.Types.ObjectId, ref: 'mainCategory' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'subCategory' }],
    breedId: { type: Schema.Types.ObjectId, ref: 'Breed' },
    title: { type: String },
    description: { type: String },
    timeInMin: { type: Number },
    totalTime: { type: String },
    variations: [{
        walksPerDay: { type: Number, },
        daysPerWeek: { type: Number, },
        oneTimeoriginalPrice: { type: Number },
        oneTimediscountActive: { type: Boolean, default: false },
        oneTimediscount: { type: Number },
        oneTimediscountPrice: { type: Number },
        MonthlyoriginalPrice: { type: Number },
        MonthlydiscountActive: { type: Boolean, default: false },
        Monthlydiscount: { type: Number },
        MonthlydiscountPrice: { type: Number },
        threeMonthoriginalPrice: { type: Number },
        threeMonthdiscountActive: { type: Boolean, default: false },
        threeMonthdiscount: { type: Number },
        threeMonthdiscountPrice: { type: Number },
        sixMonthoriginalPrice: { type: Number },
        sixMonthdiscountActive: { type: Boolean, default: false },
        sixMonthdiscount: { type: Number },
        sixMonthdiscountPrice: { type: Number },
        twelveMonthoriginalPrice: { type: Number },
        twelveMonthdiscountActive: { type: Boolean, default: false },
        twelveMonthdiscount: { type: Number },
        twelveMonthdiscountPrice: { type: Number }
    }],
    images: [{ img: { type: String } }],
    rating: { type: Number, default: 0 },
    sellCount: { type: Number, default: 0 },
    validUpTo: { type: String },
    services: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service"
        },
        selectedCount: { type: Number, default: 0 },
        selected: { type: Boolean, default: false },
    }],
    addOnServices: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service"
        }
    }],
    type: { type: String, enum: ['Package'] },
    packageType: { type: String, enum: ['Multi-Pack', 'Essential', 'Standard', 'Pro'] },
    status: { type: Boolean, default: false },
}, { timestamps: true });

packageSchema.plugin(mongoosePaginate);
packageSchema.plugin(mongooseAggregatePaginate);

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
