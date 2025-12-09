import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/token";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.substring(7);

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Invalid token"));
    } else if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token expired"));
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("You do not have permission to access this resource")
      );
    }

    next();
  };
};
