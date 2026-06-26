const express = require('express');
const { listPayments, revenueSummary, updatePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', requireRoles('Admin', 'Accounts Staff'), listPayments);
router.get('/summary', requireRoles('Admin', 'Accounts Staff'), revenueSummary);
router.put('/:bookingId', requireRoles('Admin', 'Accounts Staff'), updatePayment);

module.exports = router;
