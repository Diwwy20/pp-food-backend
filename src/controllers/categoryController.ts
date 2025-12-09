import { Request, Response, NextFunction } from "express";
import { categoryService } from "../services/categoryService";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(id);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res
      .status(201)
      .json({ success: true, message: "Category created", data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.updateCategory(id, req.body);
    res.json({ success: true, message: "Category updated", data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    await categoryService.deleteCategory(id);
    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    next(error);
  }
};
