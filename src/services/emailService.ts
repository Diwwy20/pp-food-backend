import nodemailer from "nodemailer";
import { config } from "../config/env";
import { emailTemplates } from "../templates/emailTemplates";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"PP Food App" <${config.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log(`✅ Email sent to ${to} | MessageID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Gmail Error:", error);
  }
};

export const emailService = {
  sendOTP: async (email: string, otp: string) => {
    const html = emailTemplates.verifyEmail(otp);
    return sendEmail({
      to: email,
      subject: "Your Verification Code - PP Food",
      html,
    });
  },

  sendPasswordReset: async (email: string, resetURL: string) => {
    const html = emailTemplates.resetPassword(resetURL);
    return sendEmail({
      to: email,
      subject: "Reset Your Password - PP Food",
      html,
    });
  },

  sendResetSuccess: async (email: string) => {
    const html = emailTemplates.resetSuccess();
    return sendEmail({
      to: email,
      subject: "Password Reset Successful",
      html,
    });
  },
};
