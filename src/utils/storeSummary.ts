import { STORES } from "../data/stores";
import { CartItem } from "../types/models";

const storeNameById = STORES.reduce<Record<string, string>>((acc, store) => {
  acc[store.id] = store.name;
  return acc;
}, {});

export const getStoreNameById = (storeId: string): string =>
  storeNameById[storeId] ?? storeId;

export const getUniqueStoreIds = (cart: CartItem[]): string[] =>
  Array.from(new Set(cart.map((item) => item.storeId)));

export const getStoresSummary = (cart: CartItem[]): string => {
  const uniqueStoreNames = getUniqueStoreIds(cart).map((storeId) =>
    getStoreNameById(storeId)
  );

  if (uniqueStoreNames.length === 0) {
    return "Не выбран";
  }

  return uniqueStoreNames.join(", ");
};
