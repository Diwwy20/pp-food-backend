import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "A record with this information already exists",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: (err as any).errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
