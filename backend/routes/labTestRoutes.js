const express = require('express');
const router = express.Router();
const { getLabTests, createLabTest, updateLabTest } = require('../controllers/labTestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getLabTests);
router.post('/', authorize('Admin', 'Doctor', 'Nurse'), createLabTest);
router.put('/:id', authorize('Admin', 'LabTechnician', 'Doctor'), updateLabTest);

module.exports = router;
