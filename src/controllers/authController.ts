import { Request, Response, NextFunction } from "express";
import { authService } from "../services/authService";
import { config } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: config.COOKIE_SAME_SITE as "lax" | "strict" | "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for OTP.",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.verifyEmail(req.body.token);
    res.json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(
      req.body
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: "Login successful",
      data: { accessToken, user },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: token } = req.cookies;
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshToken(token);

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.cookies;

    if (req.user?.userId) {
      await authService.logout(req.user.userId, refreshToken);
    }

    res.clearCookie("refreshToken");
    res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    res.json({
      success: true,
      message: "Password reset successful. Please login.",
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageFile = req.file;

    const user = await authService.updateProfile(
      req.user!.userId,
      req.body,
      imageFile
    );

    res.json({ success: true, message: "Profile updated", data: { user } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.changePassword(req.user!.userId, req.body);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const resendOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authService.resendOTP(req.body.email);
    res.json({
      success: true,
      message: "Verification code has been resent to your email.",
    });
  } catch (error) {
    next(error);
  }
};
