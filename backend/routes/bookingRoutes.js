const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { sendEmail } = require('../config/email');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Fetch All Bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching all bookings...');
    const bookings = await Booking.find().populate('student computer');
    console.log('Bookings fetched:', bookings);
    if (!bookings)
      return res.status(404).json({ message: 'No bookings found' });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
});

// Book a Computer (No Overlaps, with Transactions)
router.post('/', authMiddleware, async (req, res) => {
  const { student, computer, startTime, endTime } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for overlapping bookings within the transaction
    const overlap = await Booking.findOne(
      {
        computer,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
        ],
      },
      null,
      { session }
    );

    if (overlap) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Time slot unavailable' });
    }

    // Create the booking within the transaction
    const booking = await Booking.create(
      [
        {
          student,
          computer,
          startTime,
          endTime,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // TODO: Uncomment and implement email sending logic
    // Send Email Notification
    // sendEmail(
    //   'student@example.com',
    //   'Booking Confirmation',
    //   `Your booking is confirmed!`
    // );

    res.json(booking);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: 'Error processing booking', error });
  }
});

module.exports = router;
