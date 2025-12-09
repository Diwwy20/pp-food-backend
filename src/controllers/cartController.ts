import { Request, Response, NextFunction } from "express";
import { cartService } from "../services/cartService";
import { AddToCartDTO, UpdateCartItemDTO } from "../types/cart";
import { BadRequestError } from "../utils/errors";

export const getMyCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await cartService.getMyCart(req.user!.userId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, quantity, selectedOptions } = req.body;

    if (!productId || !quantity) {
      throw new BadRequestError("ProductId and Quantity are required");
    }

    const payload: AddToCartDTO = {
      productId: parseInt(productId as string),
      quantity: parseInt(quantity as string),
      selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [],
    };

    const cart = await cartService.addToCart(req.user!.userId, payload);
    res.json({ success: true, message: "Added to cart", data: cart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { quantity, selectedOptions } = req.body;

    if (isNaN(itemId) || quantity === undefined) {
      throw new BadRequestError("Invalid item ID or quantity");
    }

    const payload: UpdateCartItemDTO = {
      quantity: parseInt(quantity),
      selectedOptions: Array.isArray(selectedOptions)
        ? selectedOptions
        : undefined,
    };

    const cart = await cartService.updateItem(
      req.user!.userId,
      itemId,
      payload
    );
    res.json({ success: true, message: "Cart updated", data: cart });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const itemId = parseInt(req.params.itemId);
    if (isNaN(itemId)) throw new BadRequestError("Invalid item ID");

    const cart = await cartService.removeItem(req.user!.userId, itemId);
    res.json({ success: true, message: "Item removed", data: cart });
  } catch (error) {
    next(error);
  }
};
