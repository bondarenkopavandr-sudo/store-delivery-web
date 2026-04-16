/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEOCODER_PROVIDER?: "google" | "yandex" | "nominatim";
  readonly VITE_GOOGLE_GEOCODING_API_KEY?: string;
  readonly VITE_YANDEX_GEOCODER_API_KEY?: string;
  readonly VITE_YANDEX_MAPS_API_KEY?: string;
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_EMAILJS_PRIVATE_KEY?: string;
  readonly VITE_ORDER_RECIPIENT_EMAIL?: string;

  readonly EXPO_PUBLIC_GEOCODER_PROVIDER?: "google" | "yandex" | "nominatim";
  readonly EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY?: string;
  readonly EXPO_PUBLIC_YANDEX_GEOCODER_API_KEY?: string;
  readonly EXPO_PUBLIC_YANDEX_MAPS_API_KEY?: string;
  readonly EXPO_PUBLIC_EMAILJS_SERVICE_ID?: string;
  readonly EXPO_PUBLIC_EMAILJS_TEMPLATE_ID?: string;
  readonly EXPO_PUBLIC_EMAILJS_PUBLIC_KEY?: string;
  readonly EXPO_PUBLIC_EMAILJS_PRIVATE_KEY?: string;
  readonly EXPO_PUBLIC_ORDER_RECIPIENT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
