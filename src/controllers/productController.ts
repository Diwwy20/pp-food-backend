import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";
import { CreateProductDTO, UpdateProductDTO } from "../types";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query, category, isAvailable, isRecommended } = req.query;
    const products = await productService.getAllProducts(
      query as string,
      category as string,
      isAvailable as string,
      isRecommended as string
    );
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const body = req.body as CreateProductDTO;

    const product = await productService.createProduct(body, files || []);
    res
      .status(201)
      .json({ success: true, message: "Product created", data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];
    const body = req.body as UpdateProductDTO;

    let deleteIds: number[] = [];
    if (body.deleteImageIds) {
      if (typeof body.deleteImageIds === "string") {
        try {
          const parsed = JSON.parse(body.deleteImageIds);
          if (Array.isArray(parsed)) deleteIds = parsed;
          else deleteIds = body.deleteImageIds.split(",").map(Number);
        } catch {
          deleteIds = body.deleteImageIds.split(",").map(Number);
        }
      } else if (Array.isArray(body.deleteImageIds)) {
        deleteIds = body.deleteImageIds;
      }
    }

    const product = await productService.updateProduct(
      id,
      body,
      files || [],
      deleteIds
    );
    res.json({ success: true, message: "Product updated", data: product });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await productService.deleteProduct(parseInt(req.params.id));
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await productService.deleteProductImage(parseInt(req.params.imgId));
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    next(error);
  }
};
