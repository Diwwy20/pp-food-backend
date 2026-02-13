import * as brevo from "@getbrevo/brevo";
import { config } from "../config/env";
import { emailTemplates } from "../templates/emailTemplates";

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  config.BREVO_API_KEY,
);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;
  sendSmtpEmail.sender = {
    name: config.BREVO_SENDER_NAME,
    email: config.BREVO_SENDER_EMAIL,
  };
  sendSmtpEmail.to = [{ email: to }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent via Brevo to ${to} | ID: ${data.body.messageId}`);
  } catch (error) {
    console.error("Brevo API Error:", error);
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
