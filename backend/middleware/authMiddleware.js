const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: No token provided' });
    }

    // Decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded Token:', decoded);

    // Find the admin by email instead of ID
    const admin = await Admin.findOne({ email: decoded.email }).select(
      '-password'
    );

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Attach admin details to request object
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.superAdminMiddleware = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied: Super Admin only' });
  }
  next();
};
