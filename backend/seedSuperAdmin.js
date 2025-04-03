require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const seedSuperAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existingAdmin = await Admin.findOne({
    email: 'negceslab@gmail.com',
  });
  if (existingAdmin) {
    console.log('Super Admin already exists.');
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash('iB6H4218pDuB', 10);

  const superAdmin = new Admin({
    name: 'Super Admin',
    email: 'negceslab@gmail.com',
    password: hashedPassword,
    role: 'super_admin',
    settings: {
      passwordUpdate: true,
      enableEmailNotification: true,
      ccAdminOnEmails: true,
      emailTemplate: 'Your booking is confirmed!',
    },
  });

  await superAdmin.save();
  console.log('Super Admin inserted successfully.');
  process.exit();
};

seedSuperAdmin().catch((err) => console.error(err));
