const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  computer: { type: mongoose.Schema.Types.ObjectId, ref: 'Computer' },
  startTime: Date,
  endTime: Date,
});

BookingSchema.index(
  { computer: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

module.exports = mongoose.model('Booking', BookingSchema);
