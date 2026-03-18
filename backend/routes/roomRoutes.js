const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getRooms);
router.post('/', authorize('Admin'), createRoom);
router.put('/:id', authorize('Admin', 'Nurse'), updateRoom);

module.exports = router;
