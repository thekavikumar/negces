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
    res.status(201).json(computer); // 201 for resource creation
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get All Computers (All Admins)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const computers = await Computer.find();
    res.json(computers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Computer (Super Admin)
router.put('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const computer = await Computer.findById(id);

    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    // Update the computer with the new data from req.body
    Object.assign(computer, req.body);
    const updatedComputer = await computer.save();

    res.json(updatedComputer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete Computer (Super Admin)
router.delete(
  '/:id',
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const computer = await Computer.findById(id);

      if (!computer) {
        return res.status(404).json({ message: 'Computer not found' });
      }

      await computer.deleteOne();
      res.json({ message: 'Computer deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.patch('/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const computer = await Computer.findById(id);

    if (!computer) {
      return res.status(404).json({ message: 'Computer not found' });
    }

    // Update the computer with the new data from req.body
    Object.assign(computer, req.body);
    const updatedComputer = await computer.save();

    res.json(updatedComputer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
