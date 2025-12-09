import jwt from "jsonwebtoken";
import crypto from "crypto";
import argon2 from "argon2";
import { config } from "../config/env";

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload;
};

export const hashToken = async (token: string): Promise<string> => {
  return argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
};

export const verifyHashedToken = async (
  token: string,
  hashedToken: string
): Promise<boolean> => {
  return argon2.verify(hashedToken, token);
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};
