const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    isAdmitted: { type: Boolean, default: false },
    admissionDate: { type: Date },
    dischargeDate: { type: Date },
    patientId: { type: String, unique: true },
    status: { type: String, enum: ['Active', 'Discharged', 'Critical'], default: 'Active' },
  },
  { timestamps: true }
);

// Auto-generate patient ID
patientSchema.pre('save', async function (next) {
  if (!this.patientId) {
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `PID-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Patient', patientSchema);
