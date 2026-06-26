const express = require('express');
const { listDocuments, getDocument, createDocument, getByBooking, updateDocument, updateStatus, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff', 'Accounts Staff'), listDocuments);
router.post('/', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), upload.single('file'), createDocument);

router.get('/booking/:bookingId', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff', 'Accounts Staff'), getByBooking);
router.get('/:id', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff', 'Accounts Staff'), getDocument);
router.put('/:id', requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'), upload.single('file'), updateDocument);
router.put(
  '/:id/status',
  requireRoles('Admin', 'Operations Staff', 'Warehouse Staff'),
  upload.single('file'),
  updateStatus
);
router.delete('/:id', requireRoles('Admin'), deleteDocument);

module.exports = router;
