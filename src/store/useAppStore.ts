import { create } from "zustand";
import { CartItem, DeliveryLocation, Product } from "../types/models";

type AppStore = {
  selectedStoreId: string | null;
  selectedStoreName: string | null;
  cart: CartItem[];
  deliveryLocation: DeliveryLocation | null;
  setStore: (storeId: string, storeName: string) => void;
  clearCart: () => void;
  addToCart: (product: Product) => void;
  decreaseCartItem: (productId: string) => void;
  setDeliveryLocation: (location: DeliveryLocation) => void;
  resetAfterOrder: () => void;
};

export const useAppStore = create<AppStore>((set) => ({
  selectedStoreId: null,
  selectedStoreName: null,
  cart: [],
  deliveryLocation: null,
  setStore: (storeId, storeName) =>
    set({
      selectedStoreId: storeId,
      selectedStoreName: storeName
    }),
  clearCart: () => set({ cart: [] }),
  addToCart: (product) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);

      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        };
      }

      return {
        cart: [
          ...state.cart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            weightKg: product.weightKg,
            quantity: 1,
            storeId: product.storeId
          }
        ]
      };
    }),
  decreaseCartItem: (productId) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === productId);
      if (!existing) {
        return state;
      }

      if (existing.quantity <= 1) {
        return {
          cart: state.cart.filter((item) => item.id !== productId)
        };
      }

      return {
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
      };
    }),
  setDeliveryLocation: (location) => set({ deliveryLocation: location }),
  resetAfterOrder: () =>
    set({
      selectedStoreId: null,
      selectedStoreName: null,
      cart: [],
      deliveryLocation: null
    })
}));
