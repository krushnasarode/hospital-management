const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password').populate('department', 'name').sort({ name: 1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('department', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Staff deactivated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
