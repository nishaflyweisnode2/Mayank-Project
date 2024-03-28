const mongoose = require('mongoose');


const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: String
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  leaveType: {
    type: String,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Cancelled'],
    default: 'Pending',
  },
});


module.exports = mongoose.model('Leave', leaveSchema);
