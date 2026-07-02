import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Default to standard SMTP settings, typically port 587 for TLS
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER || '', // Brevo SMTP Login
    pass: process.env.BREVO_SMTP_PASSWORD || '', // Brevo SMTP Key
  },
});

export interface SendEmailOptions {
  to: string | string[];
  replyTo?: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Sends an email using the configured Nodemailer transport (Brevo).
 */
export const sendEmail = async (options: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"KennyKentola Ecosystem" <${process.env.DEFAULT_FROM_EMAIL || 'peterkehindeademola@gmail.com'}>`,
      to: options.to,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
