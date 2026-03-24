const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  startWaiting,
  endWaiting,
  getWaitingHistory,
  getActiveSession
} = require('../controllers/waitingController');

// All routes are protected
router.use(protect);

router.post('/start', startWaiting);
router.post('/end', endWaiting);
router.get('/history', getWaitingHistory);
router.get('/active', getActiveSession);

module.exports = router;
