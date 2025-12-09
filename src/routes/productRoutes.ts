import express from "express";
import * as productController from "../controllers/productController";
import { authenticate, authorize } from "../middlewares/auth";
import { createUploadMiddleware } from "../middlewares/upload";
import {
  createProductValidation,
  updateProductValidation,
  handleValidationErrors,
} from "../utils/validation";

const router = express.Router();
const uploadProduct = createUploadMiddleware("products");

router.get("/", productController.getProducts);

router.use(authenticate);
router.use(authorize("ADMIN"));

router.post(
  "/",
  uploadProduct.array("images", 5),
  createProductValidation,
  handleValidationErrors,
  productController.createProduct
);

router.put(
  "/:id",
  uploadProduct.array("images", 5),
  updateProductValidation,
  handleValidationErrors,
  productController.updateProduct
);

router.delete("/:id", productController.deleteProduct);
router.delete("/image/:imgId", productController.deleteProductImage);

export default router;
