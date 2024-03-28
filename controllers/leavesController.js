const Leave = require('../models/leavesModel');

exports.createLeave = async (req, res) => {
    try {
        const leave = new Leave(req.body);
        await leave.save();
        res.status(201).json(leave);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.getAllLeaves = async (req, res) => {
    try {
        const user = req.user;
        const leaves = await Leave.find({ employeeId: user.id });
        res.json({
            user: {
                name: user.fullName,
                email: user.email,
                mobile: user.phone
            },
            leaves
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        res.json({
            user: {
                name: user.fullName,
                email: user.email,
                mobile: user.phone
            },
            leave
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
