const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createOffice,
  getOffices,
  getOfficeById,
  updateOffice,
  getOfficeStats
} = require('../controllers/officeController');

// Public routes
router.get('/', getOffices);
router.get('/:id', getOfficeById);
router.get('/:id/stats', getOfficeStats);

// Admin only routes
router.post('/', protect, authorize('admin'), createOffice);
router.put('/:id', protect, authorize('admin'), updateOffice);

module.exports = router;
