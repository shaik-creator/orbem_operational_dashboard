const express = require('express');
const {
  listBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  updateStatus,
  getTimeline,
  addTimelineEntry
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router
  .route('/')
  .get(requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), listBookings)
  .post(requireRoles('Admin', 'Operations Staff'), createBooking);
router
  .route('/:id')
  .get(requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), getBooking)
  .put(requireRoles('Admin', 'Operations Staff'), updateBooking)
  .delete(requireRoles('Admin'), deleteBooking);
router
  .route('/:id/timeline')
  .get(requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), getTimeline)
  .post(requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), addTimelineEntry);
router.put('/:id/status', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), updateStatus);

module.exports = router;
