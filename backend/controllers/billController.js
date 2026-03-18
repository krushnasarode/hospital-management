const Bill = require('../models/Bill');

exports.getBills = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const bills = await Bill.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Bill.countDocuments(query);
    // Revenue stats
    const totalRevenue = await Bill.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const pendingAmount = await Bill.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.json({
      success: true, bills, total,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingAmount: pendingAmount[0]?.total || 0,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createBill = async (req, res) => {
  try {
    const bill = await Bill.create({ ...req.body, createdBy: req.user._id });
    const populated = await bill.populate('patient', 'firstName lastName patientId');
    res.status(201).json({ success: true, bill: populated });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateBillStatus = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;
    const updateData = { status };
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status === 'Paid') updateData.paidAt = new Date();
    const bill = await Bill.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('patient', 'firstName lastName patientId');
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, bill });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteBill = async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
