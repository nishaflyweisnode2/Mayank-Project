// const mongoose = require('mongoose');
// const mongoosePaginate = require("mongoose-paginate");
// const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
// const schema = mongoose.Schema;
// var storeSchema = new schema({
//         mainCategoryId: {
//                 type: schema.Types.ObjectId,
//                 ref: "mainCategory"
//         },
//         categoryId: {
//                 type: schema.Types.ObjectId,
//                 ref: "Category"
//         },
//         subCategoryId: [{
//                 type: schema.Types.ObjectId,
//                 ref: "subCategory"
//         }],
//         servicePackageId: [{
//                 type: schema.Types.ObjectId,
//                 ref: "servicePackage"
//         }],
//         serviceTypes: {
//                 type: schema.Types.ObjectId,
//                 ref: "ServiceTypeRef"
//         },
//         title: {
//                 type: String
//         },
//         description: {
//                 type: Array
//         },
//         originalPrice: {
//                 type: Number
//         },
//         discountActive: {
//                 type: Boolean,
//                 default: false
//         },
//         discount: {
//                 type: Number
//         },
//         discountPrice: {
//                 type: Number
//         },
//         timeInMin: {
//                 type: Number
//         },
//         totalTime: {
//                 type: String
//         },
//         images: [{
//                 img: {
//                         type: String
//                 }
//         }],
//         E4uSafety: {
//                 type: Array
//         },
//         thingsToKnow: {
//                 type: Array
//         },
//         E4uSuggestion: {
//                 type: Array
//         },
//         items: [{
//                 item: {
//                         type: schema.Types.ObjectId,
//                         ref: "item"
//                 }
//         }],
//         rating: {
//                 type: Number,
//                 default: 0
//         },
//         sellCount: {
//                 type: Number,
//                 default: 0
//         },
//         useBy: {
//                 type: String,
//                 enum: ["Male", "Female", "Both"]
//         },
//         services: [{
//                 service: {
//                         type: schema.Types.ObjectId,
//                         ref: "services"
//                 }
//         }],
//         selectedCount: {
//                 type: Number,
//                 default: 0
//         },
//         selected: {
//                 type: Boolean,
//                 default: false
//         },
//         type: {
//                 type: String,
//                 enum: ["Service", "Package"]
//         },
//         packageType: {
//                 type: String,
//                 enum: ["Customise", "Normal", "Edit"]
//         },

// }, { timestamps: true });
// storeSchema.plugin(mongoosePaginate);
// storeSchema.plugin(mongooseAggregatePaginate);
// module.exports = mongoose.model("services", storeSchema);


const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    mainCategoryId: { type: Schema.Types.ObjectId, ref: 'mainCategory' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: [{ type: Schema.Types.ObjectId, ref: 'subCategory' }],
    servicePackageId: { type: Schema.Types.ObjectId, ref: 'servicePackage' },
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
    selectedCount: { type: Number, default: 0 },
    selected: { type: Boolean, default: false },
    type: { type: String, enum: ['Service'] },
    status: { type: Boolean, default: false },
    isServiceTypes: { type: Boolean, default: false },
}, { timestamps: true });

serviceSchema.plugin(mongoosePaginate);
serviceSchema.plugin(mongooseAggregatePaginate);

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
