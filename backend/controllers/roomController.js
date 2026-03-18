const Room = require('../models/Room');

exports.getRooms = async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    const rooms = await Room.find(query).populate('department', 'name').populate('currentPatient', 'firstName lastName patientId').sort({ roomNumber: 1 });
    res.json({ success: true, rooms });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
