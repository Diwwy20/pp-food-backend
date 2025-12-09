import dotenv from "dotenv";

dotenv.config();

type ExpiresInString = `${number}${"d" | "h" | "m" | "s"}`;

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;

  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;

  JWT_ACCESS_EXPIRES_IN: ExpiresInString;
  JWT_REFRESH_EXPIRES_IN: ExpiresInString;

  SMTP_USER: string;
  SMTP_PASS: string;
  FRONTEND_URL: string;
  COOKIE_SECURE: boolean;
  COOKIE_SAME_SITE: "strict" | "lax" | "none";

  // OMISE_PUBLIC_KEY: string;
  // OMISE_SECRET_KEY: string;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  PORT: parseInt(getEnvVar("PORT", "5000"), 10),
  DATABASE_URL: getEnvVar("DATABASE_URL"),

  JWT_ACCESS_SECRET: getEnvVar("ACCESS_TOKEN_SECRET"),
  JWT_REFRESH_SECRET: getEnvVar("REFRESH_TOKEN_SECRET"),

  JWT_ACCESS_EXPIRES_IN: getEnvVar(
    "ACCESS_TOKEN_EXPIRES_IN",
    "15m"
  ) as ExpiresInString,
  JWT_REFRESH_EXPIRES_IN: getEnvVar(
    "REFRESH_TOKEN_EXPIRES_IN",
    "7d"
  ) as ExpiresInString,

  SMTP_USER: getEnvVar("SMTP_USER"),
  SMTP_PASS: getEnvVar("SMTP_PASS"),
  FRONTEND_URL: getEnvVar("FRONTEND_URL"),
  COOKIE_SECURE: getEnvVar("COOKIE_SECURE", "false") === "true",
  COOKIE_SAME_SITE: getEnvVar("COOKIE_SAME_SITE", "lax") as
    | "strict"
    | "lax"
    | "none",
  // OMISE_PUBLIC_KEY: getEnvVar("OMISE_PUBLIC_KEY"),
  // OMISE_SECRET_KEY: getEnvVar("OMISE_SECRET_KEY"),
};
