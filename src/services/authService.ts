import prisma from "../database/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
  verifyHashedToken,
  generateOTP,
} from "../utils/token";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { emailService } from "./emailService";
import { config } from "../config/env";
import { RegisterDTO, UpdateProfileDTO } from "../types";

export const authService = {
  // register: async (data: RegisterDTO) => {
  //   const { email, password, firstName, lastName, nickName } = data;

  //   const existingUser = await prisma.user.findUnique({ where: { email } });

  //   const passwordHash = await hashPassword(password);
  //   const otp = generateOTP();
  //   const otpExpiry = new Date(Date.now() + 30 * 60 * 1000);

  //   if (existingUser) {
  //     if (existingUser.isVerified) {
  //       throw new ConflictError("Email already registered");
  //     }

  //     const updatedUser = await prisma.user.update({
  //       where: { email },
  //       data: {
  //         passwordHash: passwordHash,
  //         firstName: firstName || null,
  //         lastName: lastName || null,
  //         nickName: nickName || null,
  //         verificationToken: otp,
  //         verificationTokenExpiry: otpExpiry,
  //       },
  //       select: {
  //         id: true,
  //         email: true,
  //         firstName: true,
  //         lastName: true,
  //         nickName: true,
  //       },
  //     });

  //     await emailService.sendOTP(email, otp);

  //     return updatedUser;
  //   }

  //   const newUser = await prisma.user.create({
  //     data: {
  //       email,
  //       passwordHash,
  //       firstName: firstName || null,
  //       lastName: lastName || null,
  //       nickName: nickName || null,
  //       verificationToken: otp,
  //       verificationTokenExpiry: otpExpiry,
  //       isVerified: false,
  //     },
  //     select: {
  //       id: true,
  //       email: true,
  //       firstName: true,
  //       lastName: true,
  //       nickName: true,
  //     },
  //   });

  //   await emailService.sendOTP(email, otp);

  //   return newUser;
  // },

  register: async (data: RegisterDTO) => {
    const { email, password, firstName, lastName, nickName } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    const passwordHash = await hashPassword(password);

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        nickName: nickName || null,

        isVerified: true,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        nickName: true,
        role: true,
        isVerified: true,
      },
    });

    return newUser;
  },

  verifyEmail: async (token: string) => {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() },
        isVerified: false,
      },
    });

    if (!user)
      throw new BadRequestError("Invalid or expired verification token");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return true;
  },

  login: async (data: { email: string; password: string }) => {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedError("Invalid email or password");

    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid)
      throw new UnauthorizedError("Invalid email or password");

    if (!user.isVerified)
      throw new UnauthorizedError("Please verify your email before logging in");

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);
    const hashedRefreshToken = await hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        tokenHash: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    return { user: userInfo, accessToken, refreshToken };
  },

  refreshToken: async (token: string) => {
    if (!token) throw new UnauthorizedError("Refresh token not found");

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (e) {
      throw new UnauthorizedError("Invalid refresh token format");
    }

    const savedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.userId,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!savedToken) {
      throw new UnauthorizedError("Invalid refresh token (Reuse detected)");
    }

    const isValid = await verifyHashedToken(token, savedToken.tokenHash);
    if (!isValid) throw new UnauthorizedError("Invalid refresh token");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new UnauthorizedError("User not found");

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);
    const newHashedRT = await hashToken(newRefreshToken);

    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          tokenHash: newHashedRT,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          replacedById: savedToken.id,
        },
      }),
      prisma.refreshToken.update({
        where: { id: savedToken.id },
        data: { revoked: true },
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  logout: async (userId: number, refreshToken?: string) => {
    if (refreshToken) {
      const tokens = await prisma.refreshToken.findMany({
        where: { userId, revoked: false },
      });

      for (const token of tokens) {
        const isMatch = await verifyHashedToken(refreshToken, token.tokenHash);
        if (isMatch) {
          await prisma.refreshToken.update({
            where: { id: token.id },
            data: { revoked: true },
          });
          break;
        }
      }
      return true;
    }

    await prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });

    return true;
  },

  forgotPassword: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: otp, resetTokenExpiry: expiry },
    });

    const resetURL = `${config.FRONTEND_URL}/reset-password?token=${otp}`;
    await emailService.sendPasswordReset(email, resetURL);
  },

  resetPassword: async (token: string, newPassword: string) => {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) throw new BadRequestError("Invalid or expired reset token");

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, resetToken: null, resetTokenExpiry: null },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    await emailService.sendResetSuccess(user.email);
  },

  getProfile: async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        createdAt: true,
        nickName: true,
        profileImage: true,
      },
    });
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  updateProfile: async (
    userId: number,
    data: UpdateProfileDTO,
    imageFile?: Express.Multer.File
  ) => {
    const updateData: any = {
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      nickName: data.nickName || undefined,
    };

    if (imageFile) {
      const publicUrl =
        "/" + imageFile.path.replace(/\\/g, "/").replace("uploaded", "uploads");
      updateData.profileImage = publicUrl;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        nickName: true,
        role: true,
        profileImage: true,
      },
    });

    return user;
  },

  changePassword: async (
    userId: number,
    { currentPassword, newPassword }: any
  ) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const valid = await verifyPassword(user.passwordHash, currentPassword);
    if (!valid) throw new BadRequestError("Current password is incorrect");

    if (currentPassword === newPassword)
      throw new BadRequestError("New password must be different");

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      }),
    ]);
  },

  resendOTP: async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new NotFoundError("User not found");
    if (user.isVerified) throw new BadRequestError("User is already verified");

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: otp,
        verificationTokenExpiry: otpExpiry,
      },
    });

    await emailService.sendOTP(email, otp);
    return true;
  },
};
