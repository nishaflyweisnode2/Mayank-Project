const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    teamLeader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    teamMembers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;