export interface CartItemOption {
  name: string;
  value?: string | number;
  price?: number;
  [key: string]: string | number | undefined;
}

export interface AddToCartDTO {
  productId: number;
  quantity: number;
  selectedOptions?: CartItemOption[];
}

export interface UpdateCartItemDTO {
  quantity: number;
  selectedOptions?: CartItemOption[];
}
