export type StoreIconName =
  | "storefront-outline"
  | "basket-outline"
  | "cube-outline"
  | "cart-outline"
  | "pricetags-outline"
  | "sparkles-outline"
  | "medkit-outline"
  | "document-text-outline";

export type Store = {
  id: string;
  name: string;
  icon: StoreIconName;
  logoUrl: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  weightKg: number;
  storeId: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  weightKg: number;
  quantity: number;
  storeId: string;
};

export type DeliveryLocation = {
  lat: number;
  lng: number;
  address: string;
};
