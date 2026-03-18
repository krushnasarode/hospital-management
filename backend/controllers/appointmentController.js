const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
  try {
    const { date, doctorId, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }
    if (doctorId) query.doctor = doctorId;
    if (status) query.status = status;
    if (req.user.role === 'Doctor') query.doctor = req.user._id;

    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName patientId phone')
      .populate('doctor', 'name specialization')
      .populate('department', 'name')
      .sort({ date: -1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Appointment.countDocuments(query);
    res.json({ success: true, appointments, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, bookedBy: req.user._id });
    const populated = await appointment.populate([
      { path: 'patient', select: 'firstName lastName patientId' },
      { path: 'doctor', select: 'name specialization' },
    ]);
    res.status(201).json({ success: true, appointment: populated });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, prescription } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, prescription },
      { new: true }
    ).populate('patient', 'firstName lastName').populate('doctor', 'name');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
