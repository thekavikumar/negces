const express = require('express');
const Student = require('../models/Student');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Search Students
router.get('/', authMiddleware, async (req, res) => {
  const { search } = req.query;

  try {
    let students;
    if (search && typeof search === 'string') {
      students = await Student.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { rollNumber: { $regex: search, $options: 'i' } },
        ],
      }).limit(10);
    } else {
      students = await Student.find().limit(10);
    }

    res.status(200).json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res
      .status(500)
      .json({ message: 'Error searching students', error: error.message });
  }
});

// Create Student
router.post('/', authMiddleware, async (req, res) => {
  const { name, rollNumber, email, phone, department } = req.body;

  // Validate required fields
  if (!name || !rollNumber || !email || !phone || !department) {
    return res.status(400).json({
      message:
        'All fields are required: name, rollNumber, email, phone, department',
    });
  }

  // Additional validation
  const trimmedName = name.trim();
  const trimmedRollNumber = rollNumber.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone.trim();
  const trimmedDepartment = department.trim();

  // Basic phone number format check (you might want to use a more sophisticated library like libphonenumber-js)
  if (!/^\+?[1-9]\d{1,14}$/.test(trimmedPhone)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  // Basic email format check (Mongoose schema will also validate this)
  if (!/.+\@.+\..+/.test(trimmedEmail)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check for existing student with same email or rollNumber
    const existingStudent = await Student.findOne({
      $or: [{ email: trimmedEmail }, { rollNumber: trimmedRollNumber }],
    });

    if (existingStudent) {
      return res.status(409).json({
        message: 'Student with this email or roll number already exists',
        existingField:
          existingStudent.email === trimmedEmail ? 'email' : 'rollNumber',
      });
    }

    // Create new student
    const newStudent = new Student({
      name: trimmedName,
      rollNumber: trimmedRollNumber,
      email: trimmedEmail,
      phone: trimmedPhone,
      department: trimmedDepartment,
    });

    // Save student to database
    const savedStudent = await newStudent.save();

    res.status(201).json({
      message: 'Student created successfully',
      student: {
        _id: savedStudent._id,
        name: savedStudent.name,
        rollNumber: savedStudent.rollNumber,
        email: savedStudent.email,
        phone: savedStudent.phone,
        department: savedStudent.department,
      },
    });
  } catch (error) {
    console.error('Error creating student:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors,
      });
    }

    // Handle duplicate key errors (although our earlier check should catch this)
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Student with this email or roll number already exists',
      });
    }

    res.status(500).json({
      message: 'Error creating student',
      error: error.message,
    });
  }
});

module.exports = router;
