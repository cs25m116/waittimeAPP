const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  office: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Office',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hour: {
    type: Number,
    min: 0,
    max: 23
  },
  totalWaitCount: {
    type: Number,
    default: 0
  },
  averageWaitTime: {
    type: Number, // in minutes
    default: 0
  },
  maxWaitTime: {
    type: Number,
    default: 0
  },
  minWaitTime: {
    type: Number,
    default: 0
  },
  peakHour: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

AnalyticsSchema.index({ office: 1, date: 1, hour: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
