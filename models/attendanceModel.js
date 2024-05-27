const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    mainCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'mainCategory'
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
    totalBookedUsers: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
