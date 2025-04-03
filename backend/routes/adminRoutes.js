const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {
  authMiddleware,
  superAdminMiddleware,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create Admin (Super Admin Only)
router.post(
  '/create',
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role,
      });
      res.json(admin);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ token });
});

module.exports = router;
