const express = require('express');
const {
  listRevenue,
  getRevenue,
  createRevenue,
  updateRevenue,
  deleteRevenue,
  revenueSummary
} = require('../controllers/revenueController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', requireRoles('Admin', 'Accounts Staff'), listRevenue);
router.get('/summary', requireRoles('Admin', 'Accounts Staff'), revenueSummary);
router.post('/', requireRoles('Admin', 'Accounts Staff'), createRevenue);

router.get('/:id', requireRoles('Admin', 'Accounts Staff'), getRevenue);
router.put('/:id', requireRoles('Admin', 'Accounts Staff'), updateRevenue);
router.delete('/:id', requireRoles('Admin'), deleteRevenue);

module.exports = router;
