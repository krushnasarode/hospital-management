const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String },
    category: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Other'], default: 'Tablet' },
    manufacturer: { type: String },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    price: { type: Number, required: true },
    expiryDate: { type: Date },
    reorderLevel: { type: Number, default: 10 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
