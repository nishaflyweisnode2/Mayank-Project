const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    date: {
        type: Date,
    },
    allDay: {
        type: Boolean,
        default: false
    },
    timeSlots: [{
        startTime: {
            type: String,
        },
        endTime: {
            type: String,
        },
        available: {
            type: Boolean,
            default: true
        }
    }],
    isMarkAttendance: {
        type: Boolean,
        default: false
    },
    
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
