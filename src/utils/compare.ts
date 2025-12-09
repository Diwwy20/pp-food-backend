import { CartItemOption } from "../types/cart";

export const areOptionsEqual = (
  options1: CartItemOption[] | unknown,
  options2: CartItemOption[] | unknown
): boolean => {
  const arr1 = Array.isArray(options1) ? (options1 as CartItemOption[]) : [];
  const arr2 = Array.isArray(options2) ? (options2 as CartItemOption[]) : [];

  if (arr1.length !== arr2.length) return false;

  if (arr1.length === 0 && arr2.length === 0) return true;

  const sortFunc = (a: CartItemOption, b: CartItemOption) =>
    JSON.stringify(a).localeCompare(JSON.stringify(b));

  const sorted1 = [...arr1].sort(sortFunc);
  const sorted2 = [...arr2].sort(sortFunc);

  return JSON.stringify(sorted1) === JSON.stringify(sorted2);
};
