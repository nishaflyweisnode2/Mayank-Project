const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
    {
        phoneCall: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        whatsappChat: {
            type: String,
            required: true,
        },
    },
);

module.exports = mongoose.model("HelpLines", contactUsSchema);
