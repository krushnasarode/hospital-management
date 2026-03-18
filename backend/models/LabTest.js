const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testName: { type: String, required: true },
    category: { type: String, enum: ['Blood', 'Urine', 'Stool', 'Imaging', 'Pathology', 'Microbiology', 'Other'], default: 'Blood' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
    result: { type: String },
    normalRange: { type: String },
    unit: { type: String },
    notes: { type: String },
    price: { type: Number, default: 0 },
    completedAt: { type: Date },
    technicianNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabTest', labTestSchema);
