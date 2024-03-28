const mongoose = require('mongoose');
const schema = mongoose.Schema;
var storeSchema = new schema({
        serviceId: {
                type: schema.Types.ObjectId,
                ref: "services"
        },
        categoryId: {
                type: schema.Types.ObjectId,
                ref: "Category"
        },
        services: [{
                service: {
                        type: schema.Types.ObjectId,
                        ref: "services"
                },
        }],
}, { timestamps: true });
module.exports = mongoose.model("servicePackage", storeSchema);
