const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_APP_PASSWORD);
}

async function sendPasswordResetEmail(email, resetUrl) {
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_APP_PASSWORD
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `WorkOut <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your WorkOut password',
    text: `We received a request to reset your WorkOut password. Use this link within one hour: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>We received a request to reset your WorkOut password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`
  });
}

module.exports = { isEmailConfigured, sendPasswordResetEmail };