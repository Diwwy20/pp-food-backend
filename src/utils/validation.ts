import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "./errors";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError("Validation failed", errors.array());
  }
  next();
};

export const registerValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chars")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password weak (needs Uppercase, Lowercase, Number)"),
  body("firstName").optional().trim().isLength({ max: 50 }),
  body("lastName").optional().trim().isLength({ max: 50 }),
  body("nickName").optional().trim().isLength({ max: 20 }),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password required"),
];

export const verifyEmailValidation = [body("token").notEmpty()];
export const forgotPasswordValidation = [body("email").isEmail()];
export const resetPasswordValidation = [
  body("token").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
];

export const updateProfileValidation = [
  body("firstName").optional().trim().isLength({ max: 50 }),
  body("lastName").optional().trim().isLength({ max: 50 }),
  body("nickName").optional().trim().isLength({ max: 20 }),
];

export const changePasswordValidation = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8 }),
];

export const categoryValidation = [
  body("nameTh").notEmpty().trim().withMessage("Thai Name is required"),
  body("nameEn").notEmpty().trim().withMessage("English Name is required"),
];

export const createProductValidation = [
  body("nameTh").notEmpty().trim().withMessage("Thai Name is required"),
  body("nameEn").optional().trim(),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isInt()
    .withMessage("Category ID must be an integer"),

  body("isRecommended").optional().isBoolean(),
  body("isAvailable").optional().isBoolean(),
];

export const updateProductValidation = [
  body("nameTh").optional().trim().notEmpty(),
  body("price").optional().isFloat({ min: 0 }),
  body("categoryId").optional().isInt(),
];
