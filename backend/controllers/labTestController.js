const LabTest = require('../models/LabTest');

exports.getLabTests = async (req, res) => {
  try {
    const { status, patientId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (patientId) query.patient = patientId;
    const tests = await LabTest.find(query)
      .populate('patient', 'firstName lastName patientId')
      .populate('orderedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, tests });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createLabTest = async (req, res) => {
  try {
    const test = await LabTest.create({ ...req.body, orderedBy: req.user._id });
    const populated = await test.populate([
      { path: 'patient', select: 'firstName lastName patientId' },
      { path: 'orderedBy', select: 'name' },
    ]);
    res.status(201).json({ success: true, test: populated });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateLabTest = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === 'Completed') updateData.completedAt = new Date();
    const test = await LabTest.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('patient', 'firstName lastName patientId')
      .populate('orderedBy', 'name');
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
    res.json({ success: true, test });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
