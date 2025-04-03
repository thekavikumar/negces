const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  settings: {
    passwordUpdate: Boolean,
    enableEmailNotification: Boolean,
    ccAdminOnEmails: Boolean,
    emailTemplate: String,
  },
});

module.exports = mongoose.model('Admin', AdminSchema);
