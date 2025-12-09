export const emailTemplates = {
  verifyEmail: (otp: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #372117; text-align: center;">Verification Code</h2>
      <p style="color: #555; text-align: center;">Please use the following code to verify your email address:</p>
      <div style="background-color: #f4bc58; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #372117;">${otp}</span>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center;">This code will expire in 30 minutes.</p>
    </div>
  `,

  resetPassword: (resetURL: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #372117;">Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetURL}" style="display: inline-block; background-color: #f4bc58; color: #372117; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0;">Reset Password</a>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `,

  resetSuccess: () => `
    <p>Your password has been successfully reset. You can now login with your new password.</p>
  `,
};
