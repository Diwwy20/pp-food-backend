import express from "express";
import * as cartController from "../controllers/cartController";
import { authenticate } from "../middlewares/auth";

const router = express.Router();

// Require Login
router.use(authenticate);

router.get("/", cartController.getMyCart);
router.post("/items", cartController.addToCart);
router.put("/items/:itemId", cartController.updateCartItem);
router.delete("/items/:itemId", cartController.removeCartItem);

export default router;
