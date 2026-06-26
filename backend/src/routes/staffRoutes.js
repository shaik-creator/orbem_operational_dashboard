const express = require('express');
const { listStaff, createStaff, updateStaff, deleteStaff, staffActivity } = require('../controllers/staffController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/activity', requireRoles('Admin'), staffActivity);
router.get('/', requireRoles('Admin'), listStaff);
router.post('/', requireRoles('Admin'), createStaff);
router.put('/:id', requireRoles('Admin'), updateStaff);
router.delete('/:id', requireRoles('Admin'), deleteStaff);

module.exports = router;
