import { CartItem } from "../types/models";

export const MAX_DELIVERY_WEIGHT_KG = 1;

export const getCartTotalWeightKg = (cart: CartItem[]): number =>
  cart.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);

export const formatWeight = (value: number): string =>
  `${value.toFixed(2).replace(".", ",")} кг`;
