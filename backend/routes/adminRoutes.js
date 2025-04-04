const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const {
  authMiddleware,
  superAdminMiddleware,
} = require('../middleware/authMiddleware');
const { sendEmail } = require('../config/email');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Create Admin (Super Admin Only)
router.post(
  '/create',
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    const { name, email, role } = req.body;

    // Store only the email *body* in settings
    const emailTemplateBody = `
      <h2>Booking Confirmed</h2>
      <p>Dear <strong>{studentName}</strong>,</p>
      <p>
        Your booking has been confirmed for <strong>{date}</strong> from
        <strong>{startTime}</strong> to <strong>{endTime}</strong> on
        <strong>{computerName}</strong>.
      </p>
      <p>Thank you,<br />CodeLab Bookings</p>
    `;
    try {
      const settings = {
        passwordUpdate: false,
        enableEmailNotification: true,
        ccAdminOnEmails: true,
        emailTemplate: emailTemplateBody,
      };
      const admin = await Admin.create({
        name,
        email,
        role,
        settings,
      });
      res.json(admin);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Get All Admins
router.get('/', authMiddleware, superAdminMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password'); // Exclude password
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete Admin (Super Admin Only)
router.delete(
  '/:id',
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }
      // Check if the admin to be deleted is a super admin
      if (admin.role === 'super_admin' || admin.isSuperAdmin) {
        return res
          .status(403)
          .json({ message: 'Super admin cannot be deleted' });
      }

      await Admin.findByIdAndDelete(req.params.id);
      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
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

  const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    // console.log(req.admin.email);
    const admin = await Admin.findOne({ email: req.admin.email }).select(
      '-password'
    ); // Exclude password
    if (!admin) return res.status(404).json({ message: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const generatePassword = () => {
  const length = 8;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Send invitation to Admin(Super Admin Only)
router.post(
  '/invite',
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    const { id, email } = req.body;
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const password = generatePassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    admin.password = hashedPassword;
    admin.save();
    const loginUrl = `${process.env.FRONTEND_URL}`;
    const subject = 'Admin Invitation - Negces Slot Booking App';
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Admin Invitation</h2>
          <p>Hello <strong>${admin.name}</strong>,</p>
          <p>You have been invited to join the <strong>Negces Slot Booking Web App</strong> as an Admin.</p>
          <p>Your login credentials:</p>
          <table style="border-collapse: collapse; margin: 15px 0; width: 100%;">
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Email:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; border: 1px solid #ddd;">Temporary Password:</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
            </tr>
          </table>
          <p>Please <a href="${loginUrl}" style="color: #007bff; text-decoration: none;">click here to log in</a> and change your password immediately.</p>
          <p>If you have any questions, reply to this email.</p>
          <p style="margin-top: 20px;">Best Regards,<br>Negces Team</p>
          <hr style="border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly unless instructed.</p>
        </div>
      `;

    // Send email
    await sendEmail(email, subject, html);

    res.json({ message: 'Invitation sent successfully' });
  }
);

module.exports = router;
