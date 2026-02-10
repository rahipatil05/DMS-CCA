import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js"; // Adjust path if needed
import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, fullName) => {
  try {
    if (!ENV.EMAIL_HOST || !ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
      console.warn("Email configuration missing. Skipping welcome email.");
      return { success: false, message: "Email configuration missing" };
    }

    // Create Nodemailer transporter with improved stability settings
    const transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465, // true for 465, false for 587
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
      // Settings to prevent 'Connection closed unexpectedly'
      tls: {
        rejectUnauthorized: false // Helps in some network environments
      },
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to: email,
      subject: "Welcome to Multi AI Platform! 🚀",
      html: WELCOME_EMAIL_TEMPLATE(fullName, ENV.CLIENT_URL),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${email}. Message ID: ${info.messageId}`);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: error.message };
  }
};
