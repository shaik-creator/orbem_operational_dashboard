const express = require('express');
const { listTasks, createTask, updateTask, deleteTask, updateTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.route('/').get(requireRoles('Admin', 'Warehouse Staff'), listTasks).post(requireRoles('Admin'), createTask);
router.route('/:id').put(requireRoles('Admin', 'Warehouse Staff'), updateTask).delete(requireRoles('Admin'), deleteTask);
router.put('/:id/status', requireRoles('Admin', 'Warehouse Staff'), updateTaskStatus);

module.exports = router;
