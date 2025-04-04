const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Student = require('../models/Student');
const { sendEmail } = require('../config/email');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Fetch All Bookings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student')
      .populate('computer')
      .populate('admin');

    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res
      .status(500)
      .json({ message: 'Error fetching bookings', error: error.message });
  }
});

// Book a Computer
router.post('/', authMiddleware, async (req, res) => {
  const { student, computer, startTime, endTime, admin } = req.body;

  if (!student || !computer || !startTime || !endTime || !admin) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const overlap = await Booking.findOne(
      {
        computer,
        status: 'confirmed',
        $or: [
          {
            startTime: { $lte: endDate },
            endTime: { $gte: startDate },
          },
        ],
      },
      null,
      { session }
    );

    if (overlap) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ message: 'Time slot unavailable' });
    }

    const studentExists = await Student.findById(student);
    if (!studentExists) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Student not found' });
    }

    const booking = await Booking.create(
      [
        {
          student,
          computer,
          admin,
          startTime: startDate,
          endTime: endDate,
          status: 'confirmed',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const populatedBooking = await Booking.findById(booking[0]._id)
      .populate('student')
      .populate('computer')
      .populate('admin');

    // Optional: Add email notification
    // await Promise.all([
    //   sendEmail(studentExists.email, 'Booking Confirmed', 'Your booking details...'),
    //   sendEmail(req.user.email, 'Booking Created', 'You created a booking...'),
    //   sendEmail('super@codelab.edu', 'New Booking', 'A new booking was created...')
    // ]);

    res.status(201).json(populatedBooking);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Booking error:', error);
    res.status(500).json({
      message: 'Error processing booking',
      error: error.message,
    });
  }
});

module.exports = router;
