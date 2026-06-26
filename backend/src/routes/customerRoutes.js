const express = require('express');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.route('/').get(requireRoles('Admin', 'Accounts Staff', 'Operations Staff'), listCustomers).post(requireRoles('Admin', 'Accounts Staff'), createCustomer);
router
  .route('/:id')
  .get(requireRoles('Admin', 'Accounts Staff', 'Operations Staff'), getCustomer)
  .put(requireRoles('Admin', 'Accounts Staff'), updateCustomer)
  .delete(requireRoles('Admin'), deleteCustomer);

module.exports = router;
