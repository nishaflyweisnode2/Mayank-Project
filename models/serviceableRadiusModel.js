const mongoose = require('mongoose');

const serviceableAreaRadiusSchema = new mongoose.Schema({
    transportMode: {
        type: String,
        enum: ['Walking', 'Bicycle', '2 Wheeler']
    },
    radiusInKms: {
        type: Number,
    }
}, { timestamps: true });

const ServiceableAreaRadius = mongoose.model('ServiceableAreaRadius', serviceableAreaRadiusSchema);

module.exports = ServiceableAreaRadius;
