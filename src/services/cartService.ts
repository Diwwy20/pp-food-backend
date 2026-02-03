import prisma from "../database/prisma";
import { NotFoundError } from "../utils/errors";
import { areOptionsEqual } from "../utils/compare";
import { AddToCartDTO, CartItemOption, UpdateCartItemDTO } from "../types/cart";
import { Prisma } from "@prisma/client";

const calculatePricePerUnit = (basePrice: number, selectedOptions: any[]) => {
  const optionsTotal = selectedOptions.reduce(
    (sum, opt) => sum + Number(opt.price || 0),
    0,
  );
  return basePrice + optionsTotal;
};

export const cartService = {
  getMyCart: async (userId: number) => {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                options: {
                  include: { choices: true },
                },
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                  options: { include: { choices: true } },
                },
              },
            },
            orderBy: { id: "asc" },
          },
        },
      });
    }

    return cart;
  },

  addToCart: async (userId: number, data: AddToCartDTO) => {
    const { productId, quantity, selectedOptions } = data;
    const optionsToSave = selectedOptions || [];

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundError("Product not found");

    const pricePerUnit = calculatePricePerUnit(
      Number(product.price),
      optionsToSave,
    );

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    const existingItem = cart.items.find((item) => {
      return (
        item.productId === productId &&
        areOptionsEqual(item.selectedOptions, optionsToSave)
      );
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
          pricePerUnit,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          pricePerUnit,
          selectedOptions: optionsToSave as any,
        },
      });
    }

    return await cartService.getMyCart(userId);
  },

  updateItem: async (
    userId: number,
    itemId: number,
    data: UpdateCartItemDTO,
  ) => {
    const { quantity, selectedOptions } = data;

    const currentItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!currentItem) throw new NotFoundError("Item not found");

    const optionsToSave =
      selectedOptions || (currentItem.selectedOptions as any[]);
    const pricePerUnit = calculatePricePerUnit(
      Number(currentItem.product.price),
      optionsToSave,
    );

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: {
          quantity,
          selectedOptions: optionsToSave as any,
          pricePerUnit,
        },
      });
    }

    return await cartService.getMyCart(userId);
  },

  removeItem: async (userId: number, itemId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundError("Cart not found");

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return await cartService.getMyCart(userId);
  },

  clearCart: async (userId: number) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  },
};
