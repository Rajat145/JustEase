const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  // In development with no credentials, just log
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`📧 [EMAIL SKIPPED — configure .env]\nTo: ${to}\nSubject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'JustEase <noreply@justease.in>',
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text,
  });

  console.log(`📧 Email sent to ${to}`);
};

module.exports = sendEmail;
