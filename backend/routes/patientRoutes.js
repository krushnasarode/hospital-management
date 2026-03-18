const express = require('express');
const router = express.Router();
const { getPatients, getPatient, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', authorize('Admin', 'Receptionist', 'Doctor'), createPatient);
router.put('/:id', authorize('Admin', 'Receptionist', 'Doctor', 'Nurse'), updatePatient);
router.delete('/:id', authorize('Admin'), deletePatient);

module.exports = router;
