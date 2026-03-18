const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getDepartments);
router.post('/', authorize('Admin'), createDepartment);
router.put('/:id', authorize('Admin'), updateDepartment);
router.delete('/:id', authorize('Admin'), deleteDepartment);

module.exports = router;
