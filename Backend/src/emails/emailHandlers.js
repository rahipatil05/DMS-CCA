import nodemailer from "nodemailer";
import { ENV } from "../lib/env.js";
import { WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, fullName) => {
  try {
    if (!ENV.EMAIL_HOST || !ENV.EMAIL_USER || !ENV.EMAIL_PASS) {
      console.warn("Email configuration missing. Skipping welcome email.");
      return { success: false, message: "Email configuration missing" };
    }

    const transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: ENV.EMAIL_PORT === 465,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: ENV.EMAIL_FROM || ENV.EMAIL_USER,
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
