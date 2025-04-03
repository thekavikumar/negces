const express = require('express');
const Computer = require('../models/Computer');
const {
  authMiddleware,
  superAdminMiddleware,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Create Computer (Super Admin)
router.post('/', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const computer = await Computer.create(req.body);
    res.json(computer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get Computers (All Admins)
router.get('/', authMiddleware, async (req, res) => {
  const computers = await Computer.find();
  res.json(computers);
});

module.exports = router;
