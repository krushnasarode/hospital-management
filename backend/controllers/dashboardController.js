const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Room = require('../models/Room');
const LabTest = require('../models/LabTest');
const Medicine = require('../models/Medicine');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPatients, admittedPatients, totalDoctors, totalStaff,
      todayAppointments, pendingAppointments, totalAppointments,
      pendingBills, monthRevenue, totalRevenue,
      availableRooms, occupiedRooms, totalRooms,
      pendingLabTests, lowStockMeds
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ isAdmitted: true }),
      User.countDocuments({ role: 'Doctor', isActive: true }),
      User.countDocuments({ isActive: true }),
      Appointment.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } }),
      Appointment.countDocuments({ status: { $in: ['Scheduled', 'Confirmed'] } }),
      Appointment.countDocuments(),
      Bill.countDocuments({ status: 'Pending' }),
      Bill.aggregate([{ $match: { status: 'Paid', paidAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Bill.aggregate([{ $match: { status: 'Paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Room.countDocuments({ status: 'Available' }),
      Room.countDocuments({ status: 'Occupied' }),
      Room.countDocuments(),
      LabTest.countDocuments({ status: 'Pending' }),
      Medicine.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$reorderLevel'] } }),
    ]);

    // Recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'firstName lastName')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 }).limit(5);

    // Monthly revenue chart (last 6 months)
    const revenueChart = await Bill.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } }, total: { $sum: '$totalAmount' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      stats: {
        patients: { total: totalPatients, admitted: admittedPatients },
        doctors: totalDoctors,
        staff: totalStaff,
        appointments: { today: todayAppointments, pending: pendingAppointments, total: totalAppointments },
        billing: { pending: pendingBills, monthRevenue: monthRevenue[0]?.total || 0, totalRevenue: totalRevenue[0]?.total || 0 },
        rooms: { available: availableRooms, occupied: occupiedRooms, total: totalRooms },
        lab: { pending: pendingLabTests },
        pharmacy: { lowStock: lowStockMeds },
      },
      recentAppointments,
      revenueChart,
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
