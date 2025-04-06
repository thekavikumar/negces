const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Student = require('../models/Student');
const { authMiddleware } = require('../middleware/authMiddleware');
const { sendEmail } = require('../config/email');
// const moment = require('moment-timezone'); // Optional

const router = express.Router();

// Fetch All Bookings
router.get('/', authMiddleware, async (req, res) => {
  const { computer, date } = req.query;

  // Filtered fetch (if computer & date provided)
  if (computer && date) {
    try {
      const bookings = await Booking.find({
        computer,
        startTime: {
          $gte: new Date(`${date}T00:00:00.000Z`),
          $lt: new Date(`${date}T23:59:59.999Z`),
        },
      }).sort({ startTime: 1 });

      return res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      return res
        .status(500)
        .json({ message: 'Server error fetching bookings' });
    }
  }

  // Default: Fetch all bookings
  try {
    const bookings = await Booking.find()
      .populate('student')
      .populate('computer')
      .populate('admin');

    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found' });
    }

    return res.status(200).json(bookings);
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

    const studentName = `${studentExists.name}`;
    const computerName = populatedBooking.computer.name;
    const date = populatedBooking.startTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const adminName = `${populatedBooking.admin.name}`;

    const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #007bff;">Booking Confirmed</h2>
    <p>Hello <strong>${studentName}</strong>,</p>
    <p>Your booking for a computer at the <strong>Negces Lab</strong> has been confirmed.</p>

    <p>Here are your booking details:</p>
    <table style="border-collapse: collapse; margin: 15px 0; width: 100%;">
      <tr>
        <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Computer:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${computerName}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Date:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${date}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Time Slot:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${startTime} - ${endTime}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Booked By:</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${adminName}</td>
      </tr>
    </table>

    <p>Please arrive at the lab 5 minutes before your scheduled time. If you need to cancel or reschedule, contact the lab admin.</p>

    <p style="margin-top: 20px;">Best Regards,<br>The Negces Team</p>
    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
    <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly unless instructed.</p>
  </div>
`;

    await sendEmail(
      studentExists.email,
      'Booking Confirmation - Negces Slot Booking App',
      html
    );

    return res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Booking error:', error);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      message: 'Error processing booking',
      error: error.message,
    });
  }
});

module.exports = router;
