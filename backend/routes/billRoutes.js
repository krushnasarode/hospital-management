const express = require('express');
const router = express.Router();
const { getBills, createBill, updateBillStatus, deleteBill } = require('../controllers/billController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getBills);
router.post('/', authorize('Admin', 'Receptionist'), createBill);
router.put('/:id/status', authorize('Admin', 'Receptionist'), updateBillStatus);
router.delete('/:id', authorize('Admin'), deleteBill);

module.exports = router;
