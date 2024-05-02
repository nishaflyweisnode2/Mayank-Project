const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    mainCategoryId: { type: Schema.Types.ObjectId, ref: 'mainCategory' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'subCategory' }],
    size: { type: Schema.Types.ObjectId, ref: 'Size' },
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
    useBy: { type: String, enum: ['Male', 'Female', 'Both'] },
    selectedCount: { type: Number, default: 0 },
    selected: { type: Boolean, default: false },
    type: { type: String, enum: ['Service'] },
    status: { type: Boolean, default: false },
    isAddOnServices: { type: Boolean, default: false },
}, { timestamps: true });

serviceSchema.plugin(mongoosePaginate);
serviceSchema.plugin(mongooseAggregatePaginate);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
