const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAppointments);
router.post('/', authorize('Admin', 'Receptionist', 'Doctor'), createAppointment);
router.put('/:id/status', authorize('Admin', 'Receptionist', 'Doctor', 'Nurse'), updateAppointmentStatus);
router.delete('/:id', authorize('Admin', 'Receptionist'), deleteAppointment);

module.exports = router;
