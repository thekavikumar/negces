const express = require('express');
const { generateReport } = require('../controllers/reportController');
const {
  authMiddleware,
  superAdminMiddleware,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Generate and Download Report (Super Admin Only)
router.get('/download', authMiddleware, superAdminMiddleware, generateReport);

module.exports = router;
