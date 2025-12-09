import express from "express";
import * as categoryController from "../controllers/categoryController";
import { authenticate, authorize } from "../middlewares/auth";
import {
  categoryValidation,
  handleValidationErrors,
} from "../utils/validation";

const router = express.Router();

// Public
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin Only
router.use(authenticate);
router.use(authorize("ADMIN"));

router.post(
  "/",
  categoryValidation,
  handleValidationErrors,
  categoryController.createCategory
);

router.put(
  "/:id",
  categoryValidation,
  handleValidationErrors,
  categoryController.updateCategory
);

router.delete("/:id", categoryController.deleteCategory);

export default router;
