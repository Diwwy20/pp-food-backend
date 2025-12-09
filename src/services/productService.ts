import prisma from "../database/prisma";
import { Prisma } from "@prisma/client";
import { CreateProductDTO, UpdateProductDTO, ProductOptionDTO } from "../types";

export const productService = {
  createProduct: async (
    data: CreateProductDTO,
    files: Express.Multer.File[]
  ) => {
    const {
      nameTh,
      nameEn,
      descriptionTh,
      descriptionEn,
      price,
      categoryId,
      isRecommended,
      isAvailable,
      options,
    } = data;

    let optionsData: ProductOptionDTO[] = [];
    if (options && typeof options === "string") {
      try {
        optionsData = JSON.parse(options);
      } catch (e) {
        console.error("Failed to parse options", e);
      }
    }

    const imagesData = files.map((file) => ({
      url: "/" + file.path.replace(/\\/g, "/").replace("uploaded", "uploads"),
    }));

    return await prisma.product.create({
      data: {
        nameTh,
        nameEn,
        descriptionTh,
        descriptionEn,
        price: parseFloat(price.toString()),
        category: { connect: { id: parseInt(categoryId.toString()) } },
        isRecommended: isRecommended === "true" || isRecommended === true,
        isAvailable:
          isAvailable !== undefined
            ? isAvailable === "true" || isAvailable === true
            : true,

        images: {
          create: imagesData,
        },

        options: {
          create: optionsData.map((opt) => ({
            nameTh: opt.nameTh,
            nameEn: opt.nameEn,
            isRequired: opt.isRequired,
            maxSelect: opt.maxSelect,
            choices: {
              create: opt.choices.map((choice) => ({
                nameTh: choice.nameTh,
                nameEn: choice.nameEn,
                price: choice.price,
              })),
            },
          })),
        },
      },
      include: {
        images: true,
        category: true,
        options: { include: { choices: true } },
      },
    });
  },

  getAllProducts: async (
    query: string,
    categoryId?: string,
    isAvailable?: string,
    isRecommended?: string
  ) => {
    const whereCondition: Prisma.ProductWhereInput = {};

    if (query) {
      whereCondition.OR = [
        { nameTh: { contains: query } },
        { nameEn: { contains: query } },
      ];
    }

    if (categoryId && categoryId !== "all") {
      whereCondition.categoryId = parseInt(categoryId);
    }

    if (isAvailable !== undefined && isAvailable !== "all") {
      whereCondition.isAvailable = isAvailable === "true";
    }

    if (isRecommended !== undefined && isRecommended !== "all") {
      whereCondition.isRecommended = isRecommended === "true";
    }

    return await prisma.product.findMany({
      where: whereCondition,
      include: {
        images: true,
        category: true,
        options: {
          include: { choices: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  getProductById: async (id: number) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        options: { include: { choices: true } },
      },
    });
  },

  updateProduct: async (
    id: number,
    data: UpdateProductDTO,
    newFiles: Express.Multer.File[],
    deleteImageIds: number[] = []
  ) => {
    const {
      nameTh,
      nameEn,
      descriptionTh,
      descriptionEn,
      price,
      categoryId,
      isAvailable,
      isRecommended,
      options,
    } = data;

    const updateData: Prisma.ProductUpdateInput = {};
    if (nameTh) updateData.nameTh = nameTh;
    if (nameEn) updateData.nameEn = nameEn;
    if (descriptionTh) updateData.descriptionTh = descriptionTh;
    if (descriptionEn) updateData.descriptionEn = descriptionEn;
    if (price) updateData.price = parseFloat(price.toString());

    if (categoryId) {
      updateData.category = {
        connect: { id: parseInt(categoryId.toString()) },
      };
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable === "true" || isAvailable === true;
    }
    if (isRecommended !== undefined) {
      updateData.isRecommended =
        isRecommended === "true" || isRecommended === true;
    }

    await prisma.$transaction(async (tx) => {
      if (deleteImageIds.length > 0) {
        await tx.productImage.deleteMany({
          where: {
            id: { in: deleteImageIds },
            productId: id,
          },
        });
      }

      if (newFiles.length > 0) {
        const newImages = newFiles.map((file) => ({
          url:
            "/" + file.path.replace(/\\/g, "/").replace("uploaded", "uploads"),
          productId: id,
        }));
        await tx.productImage.createMany({ data: newImages });
      }

      if (options !== undefined && options !== null) {
        let optionsData: ProductOptionDTO[] = [];
        try {
          optionsData =
            typeof options === "string" ? JSON.parse(options) : options;
        } catch (e) {
          console.error("Failed to parse options during update", e);
        }

        await tx.productOption.deleteMany({ where: { productId: id } });

        for (const opt of optionsData) {
          await tx.productOption.create({
            data: {
              productId: id,
              nameTh: opt.nameTh,
              nameEn: opt.nameEn,
              isRequired: opt.isRequired,
              maxSelect: opt.maxSelect,
              choices: {
                create: opt.choices.map((c) => ({
                  nameTh: c.nameTh,
                  nameEn: c.nameEn,
                  price: c.price,
                })),
              },
            },
          });
        }
      }

      await tx.product.update({
        where: { id },
        data: updateData,
      });
    });

    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        options: { include: { choices: true } },
      },
    });
  },

  deleteProduct: async (id: number) => {
    return await prisma.product.delete({ where: { id } });
  },

  deleteProductImage: async (imageId: number) => {
    return await prisma.productImage.delete({ where: { id: imageId } });
  },
};
