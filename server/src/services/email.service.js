import nodemailer from 'nodemailer';
import { emailTemplates } from '../utils/emailTemplates.js';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Pharmacy Platform" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendVerificationOTP = async (email, otp) => {
  const subject = 'Email Verification - Pharmacy Platform';
  const html = emailTemplates.emailVerification(otp);
  return await sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email, resetLink) => {
  const subject = 'Password Reset Request - Pharmacy Platform';
  const html = emailTemplates.passwordReset(resetLink);
  return await sendEmail(email, subject, html);
};

export const sendOrderConfirmation = async (email, order) => {
  const subject = `Order Confirmed - ${order._id}`;
  const html = emailTemplates.orderConfirmation(order);
  return await sendEmail(email, subject, html);
};

export const sendOrderStatusUpdate = async (email, order) => {
  const subject = `Order Status Update - ${order._id}`;
  const html = emailTemplates.orderStatusUpdate(order);
  return await sendEmail(email, subject, html);
};

export const sendPaymentSlip = async (email, order, paymentDetails) => {
  const subject = `Payment Receipt - ${order._id}`;
  const html = emailTemplates.paymentSlip(order, paymentDetails);
  return await sendEmail(email, subject, html);
};

