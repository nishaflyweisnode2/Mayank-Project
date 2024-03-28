const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const Schema = mongoose.Schema;

const packageSchema = new Schema({
    mainCategoryId: { type: Schema.Types.ObjectId, ref: 'mainCategory' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'subCategory' }],
    servicePackageId: [{ type: Schema.Types.ObjectId, ref: 'servicePackage' }],
    serviceTypes: { type: Schema.Types.ObjectId, ref: 'ServiceTypeRef' },
    location: [{
        city: { type: mongoose.Schema.ObjectId, ref: 'City' },
        sector: { type: mongoose.Schema.ObjectId, ref: 'Area' },
        originalPrice: { type: Number },
        discountActive: { type: Boolean, default: false },
        discount: { type: Number },
        discountPrice: { type: Number },
    }],
    title: { type: String },
    description: { type: String },
    timeInMin: { type: Number },
    totalTime: { type: String },
    images: [{ img: { type: String } }],
    // E4uSafety: { type: Array },
    // thingsToKnow: { type: Array },
    // E4uSuggestion: { type: Array },
    items: [{ item: { type: Schema.Types.ObjectId, ref: 'item' } }],
    rating: { type: Number, default: 0 },
    sellCount: { type: Number, default: 0 },
    useBy: { type: String, enum: ['Male', 'Female', 'Both'] },
    // services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    services: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service"
        }
    }],
    addOnServices: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service"
        }
    }],
    selectedCount: { type: Number, default: 0 },
    selected: { type: Boolean, default: false },
    type: { type: String, enum: ['Package'] },
    packageType: { type: String, enum: ['Customize', 'Normal', 'Edit'] },
    status: { type: Boolean, default: false },
}, { timestamps: true });

packageSchema.plugin(mongoosePaginate);
packageSchema.plugin(mongooseAggregatePaginate);

const Package = mongoose.model('Package', packageSchema);
module.exports = Package;
