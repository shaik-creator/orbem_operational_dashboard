const express = require('express');
const {
  bookingsCsv,
  revenueCsv,
  pendingDocumentsCsv,
  monthlySummary
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/bookings.csv', requireRoles('Admin', 'Operations Staff'), bookingsCsv);
router.get('/revenue.csv', requireRoles('Admin', 'Accounts Staff'), revenueCsv);
router.get('/pending-documents.csv', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), pendingDocumentsCsv);
router.get('/summary', requireRoles('Admin', 'Accounts Staff', 'Operations Staff'), monthlySummary);
router.get('/monthly-summary', requireRoles('Admin', 'Accounts Staff', 'Operations Staff'), monthlySummary);

module.exports = router;
