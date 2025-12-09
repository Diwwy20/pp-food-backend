import prisma from "../database/prisma";
import { NotFoundError } from "../utils/errors";

export const categoryService = {
  getAllCategories: async () => {
    return await prisma.category.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  },

  getCategoryById: async (id: number) => {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundError("Category not found");
    return category;
  },

  createCategory: async (data: { nameTh: string; nameEn: string }) => {
    return await prisma.category.create({
      data: {
        nameTh: data.nameTh,
        nameEn: data.nameEn,
      },
    });
  },

  updateCategory: async (
    id: number,
    data: { nameTh?: string; nameEn?: string }
  ) => {
    await categoryService.getCategoryById(id);

    return await prisma.category.update({
      where: { id },
      data,
    });
  },

  deleteCategory: async (id: number) => {
    await categoryService.getCategoryById(id);

    return await prisma.category.delete({
      where: { id },
    });
  },
};
