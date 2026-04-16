import { getEnv } from "../config/env";
import { CartItem, DeliveryLocation } from "../types/models";
import { formatWeight, getCartTotalWeightKg } from "../utils/cartWeight";
import { getStoreNameById, getStoresSummary } from "../utils/storeSummary";

type SendOrderPayload = {
  storeName?: string;
  cart: CartItem[];
  total: number;
  location: DeliveryLocation;
};

const EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";
const SERVICE_ID = getEnv("VITE_EMAILJS_SERVICE_ID", "EXPO_PUBLIC_EMAILJS_SERVICE_ID");
const TEMPLATE_ID = getEnv("VITE_EMAILJS_TEMPLATE_ID", "EXPO_PUBLIC_EMAILJS_TEMPLATE_ID");
const PUBLIC_KEY = getEnv("VITE_EMAILJS_PUBLIC_KEY", "EXPO_PUBLIC_EMAILJS_PUBLIC_KEY");
const PRIVATE_KEY = getEnv("VITE_EMAILJS_PRIVATE_KEY", "EXPO_PUBLIC_EMAILJS_PRIVATE_KEY");
const RECIPIENT_EMAIL = getEnv(
  "VITE_ORDER_RECIPIENT_EMAIL",
  "EXPO_PUBLIC_ORDER_RECIPIENT_EMAIL"
);

const formatItemsList = (cart: CartItem[]) =>
  cart
    .map(
      (item) =>
        `[${getStoreNameById(item.storeId)}] ${item.name}: ${item.quantity} x ${
          item.price
        } ₽ = ${item.quantity * item.price} ₽, вес: ${formatWeight(item.weightKg * item.quantity)}`
    )
    .join("\n");

export const sendOrderByEmail = async ({
  storeName,
  cart,
  total,
  location
}: SendOrderPayload): Promise<void> => {
  const hasPlaceholders = [SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, RECIPIENT_EMAIL].some(
    (value) =>
      value.startsWith("your_") ||
      value === "orders@example.com" ||
      value.includes("xxxxx") ||
      value.includes("example.com")
  );

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY || !RECIPIENT_EMAIL) {
    throw new Error(
      "Не заданы EmailJS переменные: SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY, ORDER_RECIPIENT_EMAIL"
    );
  }

  if (hasPlaceholders) {
    throw new Error("В .env остались тестовые значения EmailJS или почты получателя");
  }

  const storeSummary = storeName ?? getStoresSummary(cart);

  const payload: {
    service_id: string;
    template_id: string;
    user_id: string;
    accessToken?: string;
    template_params: {
      to_email: string;
      store_name: string;
      order_items: string;
      total_sum: string;
      total_weight: string;
      delivery_address: string;
      delivery_coordinates: string;
    };
  } = {
    service_id: SERVICE_ID,
    template_id: TEMPLATE_ID,
    user_id: PUBLIC_KEY,
    template_params: {
      to_email: RECIPIENT_EMAIL,
      store_name: storeSummary,
      order_items: formatItemsList(cart),
      total_sum: `${total} ₽`,
      total_weight: formatWeight(getCartTotalWeightKg(cart)),
      delivery_address: location.address,
      delivery_coordinates: `${location.lat}, ${location.lng}`
    }
  };

  if (PRIVATE_KEY && !PRIVATE_KEY.startsWith("your_")) {
    payload.accessToken = PRIVATE_KEY;
  }

  const response = await fetch(EMAILJS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ошибка отправки заказа (${response.status}): ${details || "без деталей"}`);
  }
};
