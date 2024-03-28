const mongoose = require("mongoose");
const schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const mainCategoryBannerannerSchema = mongoose.Schema({
    mainCategoryId: {
        type: schema.Types.ObjectId,
        ref: "mainCategory"
    },
    image: {
        type: String
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
        enum: ["TOP", "MID", "BOTTOM", "MB"],
    },
    desc: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },

}, { timestamps: true });


mainCategoryBannerannerSchema.plugin(mongoosePaginate);
mainCategoryBannerannerSchema.plugin(mongooseAggregatePaginate);

const banner = mongoose.model("mainCategoryBanner", mainCategoryBannerannerSchema);
module.exports = banner;
