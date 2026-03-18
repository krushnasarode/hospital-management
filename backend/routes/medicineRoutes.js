const express = require('express');
const router = express.Router();
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMedicines);
router.post('/', authorize('Admin', 'Pharmacist'), createMedicine);
router.put('/:id', authorize('Admin', 'Pharmacist'), updateMedicine);
router.delete('/:id', authorize('Admin'), deleteMedicine);

module.exports = router;
