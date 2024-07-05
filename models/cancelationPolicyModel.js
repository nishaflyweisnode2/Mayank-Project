const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cancelationPolicySchema = new mongoose.Schema({
    mainCategoryId: { type: Schema.Types.ObjectId, ref: 'mainCategory' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'subCategory' },
    content: { type: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model('CancelationPolicy', cancelationPolicySchema);