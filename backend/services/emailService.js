const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Generic email sender wrapper
 */
const sendEmail = async (options) => {
  try {
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || `<p>${options.text}</p>`,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Email sending failed', error);
    return false;
  }
};

/**
 * Template: Booking Confirmation
 */
const sendBookingConfirmationEmail = async (user, booking, hotel) => {
  const html = `
    <h2>Booking Confirmed!</h2>
    <p>Dear ${user.name},</p>
    <p>Your booking at <strong>${hotel.hotelName}</strong> has been confirmed.</p>
    <ul>
      <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</li>
      <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</li>
      <li><strong>Amount Paid:</strong> $${booking.totalAmount}</li>
    </ul>
    <p>We look forward to hosting you!</p>
  `;
  return await sendEmail({ email: user.email, subject: 'Your Booking Confirmation', html });
};

/**
 * Template: Welcome Email
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <h2>Welcome to Smart Hotel Booking</h2>
    <p>Dear ${user.name},</p>
    <p>Thank you for registering an account with us. Start exploring top hotels today and earn loyalty points on every booking!</p>
  `;
  return await sendEmail({ email: user.email, subject: 'Welcome to Smart Hotel Booking', html });
};

module.exports = { sendEmail, sendBookingConfirmationEmail, sendWelcomeEmail };
