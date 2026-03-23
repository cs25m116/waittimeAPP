const WaitingSession = require('../models/WaitingSession');
const Office = require('../models/Office');
const Analytics = require('../models/Analytics');
const { getClientIp, getDeviceInfo } = require('../utils/ipHelper');

// @desc    Start waiting session
// @route   POST /api/waiting/start
// @access  Private
exports.startWaiting = async (req, res) => {
  try {
    const { officeId, location } = req.body;
    
    // Check if office exists
    const office = await Office.findById(officeId);
    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    // Check if user already has active waiting session
    const activeSession = await WaitingSession.findOne({
      user: req.user.id,
      status: 'waiting'
    });
    
    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active waiting session',
        data: activeSession
      });
    }
    
    // Create new waiting session
    const session = await WaitingSession.create({
      user: req.user.id,
      office: officeId,
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      },
      ipAddress: getClientIp(req),
      deviceInfo: getDeviceInfo(req),
      status: 'waiting'
    });
    
    res.status(201).json({
      success: true,
      message: 'Waiting session started',
      data: {
        sessionId: session._id,
        startTime: session.startTime,
        office: {
          id: office._id,
          name: office.name,
          type: office.type
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    End waiting session
// @route   POST /api/waiting/end
// @access  Private
exports.endWaiting = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;
    
    const session = await WaitingSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    if (session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    if (session.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Session already ended'
      });
    }
    
    // Calculate waiting duration
    const endTime = new Date();
    const waitingDuration = Math.round((endTime - session.startTime) / (1000 * 60)); // in minutes
    
    session.endTime = endTime;
    session.waitingDuration = waitingDuration;
    session.status = 'completed';
    
    if (rating) session.feedback = { rating, comment };
    
    await session.save();
    
    // Update analytics
    await updateAnalytics(session.office, session.startTime, waitingDuration);
    
    res.json({
      success: true,
      message: 'Waiting session ended',
      data: {
        sessionId: session._id,
        waitingDuration,
        startTime: session.startTime,
        endTime: session.endTime
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user's waiting history
// @route   GET /api/waiting/history
// @access  Private
exports.getWaitingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { user: req.user.id };
    if (status) query.status = status;
    
    const sessions = await WaitingSession.find(query)
      .populate('office', 'name type address')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await WaitingSession.countDocuments(query);
    
    res.json({
      success: true,
      count: sessions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sessions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get active waiting session
// @route   GET /api/waiting/active
// @access  Private
exports.getActiveSession = async (req, res) => {
  try {
    const session = await WaitingSession.findOne({
      user: req.user.id,
      status: 'waiting'
    }).populate('office', 'name type address workingHours');
    
    if (!session) {
      return res.json({
        success: true,
        data: null,
        message: 'No active session'
      });
    }
    
    // Calculate elapsed time
    const elapsedMinutes = Math.round((new Date() - session.startTime) / (1000 * 60));
    
    res.json({
      success: true,
      data: {
        session,
        elapsedTime: elapsedMinutes
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to update analytics
async function updateAnalytics(officeId, startTime, waitingDuration) {
  const date = new Date(startTime);
  date.setHours(0, 0, 0, 0);
  const hour = new Date(startTime).getHours();
  
  let analytics = await Analytics.findOne({
    office: officeId,
    date,
    hour
  });
  
  if (!analytics) {
    analytics = new Analytics({
      office: officeId,
      date,
      hour,
      totalWaitCount: 0,
      averageWaitTime: 0,
      maxWaitTime: 0,
      minWaitTime: waitingDuration
    });
  }
  
  // Update analytics
  const newTotalCount = analytics.totalWaitCount + 1;
  const newTotalTime = (analytics.averageWaitTime * analytics.totalWaitCount) + waitingDuration;
  analytics.totalWaitCount = newTotalCount;
  analytics.averageWaitTime = newTotalTime / newTotalCount;
  analytics.maxWaitTime = Math.max(analytics.maxWaitTime, waitingDuration);
  analytics.minWaitTime = Math.min(analytics.minWaitTime, waitingDuration);
  
  // Check if this is peak hour
  const allHoursData = await Analytics.find({ office: officeId, date });
  const maxCount = Math.max(...allHoursData.map(h => h.totalWaitCount), 0);
  analytics.peakHour = analytics.totalWaitCount === maxCount && maxCount > 0;
  
  await analytics.save();
}
