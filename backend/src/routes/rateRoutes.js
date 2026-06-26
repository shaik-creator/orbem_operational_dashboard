const express = require('express');
const {
  listRates,
  createRate,
  updateRate,
  deleteRate,
  compareRates,
  importRates,
  exportRates
} = require('../controllers/rateController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.get('/compare', requireRoles('Admin'), compareRates);
router.get('/export.csv', requireRoles('Admin'), exportRates);
router.post('/import', requireRoles('Admin'), importRates);
router.route('/').get(requireRoles('Admin'), listRates).post(requireRoles('Admin'), createRate);
router
  .route('/:id')
  .put(requireRoles('Admin'), updateRate)
  .delete(requireRoles('Admin'), deleteRate);

module.exports = router;
