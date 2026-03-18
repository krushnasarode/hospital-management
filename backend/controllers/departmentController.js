const Department = require('../models/Department');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).populate('head', 'name specialization').sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, department: dept });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, department: dept });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Department deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
