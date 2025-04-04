const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    computer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Computer',
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    validate: {
      validator: function () {
        return this.startTime < this.endTime;
      },
      message: 'End time must be after start time',
    },
  }
);

BookingSchema.index(
  { computer: 1, startTime: 1, endTime: 1 },
  {
    partialFilterExpression: { status: 'confirmed' },
  }
);

module.exports = mongoose.model('Booking', BookingSchema);
