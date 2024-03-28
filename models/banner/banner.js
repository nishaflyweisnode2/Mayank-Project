const mongoose = require("mongoose");
const schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const bannerSchema = mongoose.Schema({
    mainCategoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    categoryId: {
        type: schema.Types.ObjectId,
        ref: "Category"
    },
    subCategoryId: {
        type: schema.Types.ObjectId,
        ref: "subCategory"
    },
    servicesId: {
        type: schema.Types.ObjectId,
        ref: "services"
    },
    image: {
        type: String,
    },
    video: {
        type: String,
    },
    isVideo: {
        type: Boolean,
        default: false,
    },
    colour: {
        type: String,
    },
    position: {
        type: String,
        // enum: ["TOP", "MID", "BOTTOM", "MB"],
    },
    type: {
        type: String,
        enum: ["HeroBanner", "Offer", "Static",],
    },
    desc: {
        type: String,
    },
    buttonName: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });


bannerSchema.plugin(mongoosePaginate);
bannerSchema.plugin(mongooseAggregatePaginate);

const banner = mongoose.model("banner", bannerSchema);
module.exports = banner;
