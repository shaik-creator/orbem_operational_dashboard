const express = require('express');
const {
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  addTimelineEntry,
  deleteShipment
} = require('../controllers/shipmentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), listShipments);
router.post('/', requireRoles('Admin', 'Operations Staff'), createShipment);

router.get('/:id', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), getShipment);
router.put('/:id', requireRoles('Admin', 'Operations Staff'), updateShipment);
router.delete('/:id', requireRoles('Admin'), deleteShipment);

router.put('/:id/status', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), updateShipmentStatus);
router.post('/:id/timeline', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), addTimelineEntry);

module.exports = router;
