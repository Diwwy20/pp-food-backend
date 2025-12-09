import express from "express";
import * as authController from "../controllers/authController";
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
  handleValidationErrors,
} from "../utils/validation";
import { authenticate } from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimiter";
import { createUploadMiddleware } from "../middlewares/upload";

const router = express.Router();
const uploadProfile = createUploadMiddleware("profile");

// --- Public Routes ---
router.post(
  "/register",
  authLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register
);

router.post(
  "/verify-email",
  authLimiter,
  verifyEmailValidation,
  handleValidationErrors,
  authController.verifyEmail
);

router.post(
  "/resend-otp",
  authLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  authController.resendOTP
);

router.post(
  "/login",
  authLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

router.post("/refresh-token", authController.refreshToken);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  handleValidationErrors,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  handleValidationErrors,
  authController.resetPassword
);

// --- Private Routes (Token Required) ---
router.use(authenticate);

router.post("/logout", authController.logout);
router.get("/me", authController.getProfile);

router.put(
  "/me",
  uploadProfile.single("avatar"),
  updateProfileValidation,
  handleValidationErrors,
  authController.updateProfile
);

router.put(
  "/me/change-password",
  changePasswordValidation,
  handleValidationErrors,
  authController.changePassword
);

export default router;
