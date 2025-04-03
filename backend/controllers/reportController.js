const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Computer = require('../models/Computer');
const ExcelJS = require('exceljs');

exports.generateReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const bookings = await Booking.find({
      startTime: { $gte: new Date(startDate) },
      endTime: { $lte: new Date(endDate) },
    })
      .populate('student')
      .populate('computer')
      .populate('admin');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bookings Report');

    // Headers
    worksheet.columns = [
      { header: 'Computer Name', key: 'computerName', width: 20 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Student Name', key: 'studentName', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Admin Name', key: 'adminName', width: 20 },
      { header: 'Start Time', key: 'startTime', width: 25 },
      { header: 'End Time', key: 'endTime', width: 25 },
    ];

    // Add data
    bookings.forEach((booking) => {
      worksheet.addRow({
        computerName: booking.computer.name,
        location: booking.computer.location,
        studentName: booking.student.name,
        rollNumber: booking.student.rollNumber,
        adminName: booking.admin ? booking.admin.name : 'N/A',
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
      });
    });

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=bookings_report.xlsx'
    );

    // Send the file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
};
