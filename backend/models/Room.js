const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ['General', 'Private', 'ICU', 'Emergency', 'Operation Theatre', 'Lab'], required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    floor: { type: Number },
    capacity: { type: Number, default: 1 },
    occupied: { type: Number, default: 0 },
    pricePerDay: { type: Number, default: 0 },
    status: { type: String, enum: ['Available', 'Occupied', 'Maintenance', 'Reserved'], default: 'Available' },
    currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
