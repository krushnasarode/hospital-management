const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Confirmed', 'Arrived', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    type: { type: String, enum: ['General', 'Follow-up', 'Emergency', 'Consultation'], default: 'General' },
    reason: { type: String },
    notes: { type: String },
    prescription: { type: String },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
