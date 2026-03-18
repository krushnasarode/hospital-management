const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    const query = { isActive: true };
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { genericName: { $regex: search, $options: 'i' } },
    ];
    if (category) query.category = category;
    if (lowStock === 'true') query.$expr = { $lte: ['$stock', '$reorderLevel'] };
    const medicines = await Medicine.find(query).sort({ name: 1 });
    res.json({ success: true, medicines });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createMedicine = async (req, res) => {
  try {
    const med = await Medicine.create(req.body);
    res.status(201).json({ success: true, medicine: med });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateMedicine = async (req, res) => {
  try {
    const med = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!med) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, medicine: med });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Medicine removed' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
