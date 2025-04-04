const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Negces Lab Admin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, ''),
      replyTo: process.env.EMAIL_USER,
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Nodemailer',
        'X-Urgent': 'yes',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
