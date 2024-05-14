const mongoose = require('mongoose');

const improveSchema = new mongoose.Schema({
    punctuality: {
        type: String,
    },
    grooming: {
        type: String,
    },
    softSkills: {
        type: String,
    },
    availabilityOfProducts: {
        type: String,
    },
    skillAndKnowledge: {
        type: String,
    },
    slotAvailability: {
        type: String,
    }
});

const Improve = mongoose.model('HowToImprove', improveSchema);

module.exports = Improve;
