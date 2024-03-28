const HelpLines = require("../models/helpLineModel");


const createHelpLine = async (req, res) => {
    try {
        const { phoneCall, email, whatsappChat } = req.body;

        const newTerms = await HelpLines.create({ phoneCall, email, whatsappChat });
        res.status(201).json({
            message: "Help Line created successfully",
            data: newTerms,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};


const getAllHelpLines = async (req, res) => {
    try {
        const termsList = await HelpLines.find();
        res.status(200).json({
            message: "Help Lines data retrieved successfully",
            data: termsList,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
};

module.exports = {
    createHelpLine,
    getAllHelpLines,
};
