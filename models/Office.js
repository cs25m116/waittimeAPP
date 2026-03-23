const mongoose = require("mongoose");

const OfficeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["government", "private", "bank", "hospital", "school", "other"],
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
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
        index: "2dsphere",
      },
    },
    ipAddress: {
      type: String,
      required: true,
    },
    workingHours: {
      start: { type: String, default: "09:00" },
      end: { type: String, default: "17:00" },
      lunchStart: String,
      lunchEnd: String,
      workingDays: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
    },
    contactNumber: String,
    email: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

OfficeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Office", OfficeSchema);
