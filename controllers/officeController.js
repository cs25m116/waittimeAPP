const Office = require('../models/Office');
const WaitingSession = require('../models/WaitingSession');
const Analytics = require('../models/Analytics');
const { getClientIp } = require('../utils/ipHelper');

// @desc    Create or update office
// @route   POST /api/offices
// @access  Private/Admin
exports.createOffice = async (req, res) => {
  try {
    const officeData = {
      ...req.body,
      ipAddress: getClientIp(req)
    };
    
    const office = await Office.create(officeData);
    res.status(201).json({
      success: true,
      data: office
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all offices
// @route   GET /api/offices
// @access  Public
exports.getOffices = async (req, res) => {
  try {
    const { type, city, lat, lng, radius } = req.query;
    let query = { isActive: true };
    
    if (type) query.type = type;
    if (city) query['address.city'] = city;
    
    let offices;
    if (lat && lng && radius) {
      // Find offices within radius
      offices = await Office.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: parseInt(radius) * 1000 // convert km to meters
          }
        }
      });
    } else {
      offices = await Office.find(query);
    }
    
    res.json({
      success: true,
      count: offices.length,
      data: offices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get office by ID
// @route   GET /api/offices/:id
// @access  Public
exports.getOfficeById = async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    res.json({
      success: true,
      data: office
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update office
// @route   PUT /api/offices/:id
// @access  Private/Admin
exports.updateOffice = async (req, res) => {
  try {
    const office = await Office.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!office) {
      return res.status(404).json({
        success: false,
        message: 'Office not found'
      });
    }
    
    res.json({
      success: true,
      data: office
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get office statistics
// @route   GET /api/offices/:id/stats
// @access  Public
exports.getOfficeStats = async (req, res) => {
  try {
    const officeId = req.params.id;
    const { date, days = 7 } = req.query;
    
    const queryDate = date ? new Date(date) : new Date();
    const startDate = new Date(queryDate);
    startDate.setDate(startDate.getDate() - days);
    
    const sessions = await WaitingSession.find({
      office: officeId,
      startTime: { $gte: startDate },
      status: 'completed'
    });
    
    // Calculate statistics
    const totalWaitCount = sessions.length;
    const totalWaitTime = sessions.reduce((sum, s) => sum + s.waitingDuration, 0);
    const averageWaitTime = totalWaitCount > 0 ? totalWaitTime / totalWaitCount : 0;
    const maxWaitTime = Math.max(...sessions.map(s => s.waitingDuration), 0);
    const minWaitTime = Math.min(...sessions.map(s => s.waitingDuration), Infinity);
    
    // Group by hour for peak hour analysis
    const hourlyData = {};
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { count: 0, totalTime: 0 };
      }
      hourlyData[hour].count++;
      hourlyData[hour].totalTime += session.waitingDuration;
    });
    
    const peakHour = Object.entries(hourlyData).sort((a, b) => b[1].count - a[1].count)[0];
    
    res.json({
      success: true,
      data: {
        totalWaitCount,
        averageWaitTime: Math.round(averageWaitTime),
        maxWaitTime,
        minWaitTime: minWaitTime === Infinity ? 0 : minWaitTime,
        peakHour: peakHour ? {
          hour: peakHour[0],
          count: peakHour[1].count,
          averageWaitTime: Math.round(peakHour[1].totalTime / peakHour[1].count)
        } : null,
        hourlyBreakdown: hourlyData
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
