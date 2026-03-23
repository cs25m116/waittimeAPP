const mongoose = require("mongoose");

const WaitingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    office: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Office",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endTime: {
      type: Date,
    },
    waitingDuration: {
      type: Number, // in minutes
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    ipAddress: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: {
        platform: String,
        browser: String,
        device: String,
      },
    },
    status: {
      type: String,
      enum: ["waiting", "completed", "cancelled"],
      default: "waiting",
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
    },
  },
  {
    timestamps: true,
  },
);

WaitingSessionSchema.index({ user: 1, startTime: -1 });
WaitingSessionSchema.index({ office: 1, startTime: -1 });

module.exports = mongoose.model("WaitingSession", WaitingSessionSchema);
