import prisma from "../database/prisma";
import { NotFoundError } from "../utils/errors";
import { areOptionsEqual } from "../utils/compare";
import { AddToCartDTO, CartItemOption, UpdateCartItemDTO } from "../types/cart";
import { Prisma } from "@prisma/client";

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

    const optionsToSave: CartItemOption[] = selectedOptions || [];

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
      const isSameProduct = item.productId === productId;

      const existingOptions = item.selectedOptions as unknown as
        | CartItemOption[]
        | null;

      const isSameOptions = areOptionsEqual(existingOptions, optionsToSave);

      return isSameProduct && isSameOptions;
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          selectedOptions: optionsToSave as Prisma.InputJsonValue,
        },
      });
    }

    return await cartService.getMyCart(userId);
  },

  updateItem: async (
    userId: number,
    itemId: number,
    data: UpdateCartItemDTO
  ) => {
    const { quantity, selectedOptions } = data;

    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new NotFoundError("Cart not found");

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new NotFoundError("Item not found in cart");

    if (quantity <= 0) {
      return await prisma.cartItem.delete({ where: { id: itemId } });
    }

    const updateData: Prisma.CartItemUpdateInput = { quantity };

    if (selectedOptions) {
      updateData.selectedOptions = selectedOptions as Prisma.InputJsonValue;
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
    });

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
