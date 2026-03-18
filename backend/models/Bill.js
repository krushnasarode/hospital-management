const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    invoiceNumber: { type: String, unique: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        total: { type: Number },
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Partially Paid', 'Cancelled'], default: 'Pending' },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'Insurance', 'Online'], default: 'Cash' },
    paidAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

billSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  // Calculate item totals
  if (this.items) {
    this.items.forEach((item) => {
      item.total = item.quantity * item.unitPrice;
    });
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
