import { getEnv } from "../config/env";

type GeocoderProvider = "google" | "yandex" | "nominatim";

const GOOGLE_KEY = getEnv(
  "VITE_GOOGLE_GEOCODING_API_KEY",
  "EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY"
);
const YANDEX_KEY = getEnv(
  "VITE_YANDEX_GEOCODER_API_KEY",
  "EXPO_PUBLIC_YANDEX_GEOCODER_API_KEY"
);
const requestedProvider = getEnv(
  "VITE_GEOCODER_PROVIDER",
  "EXPO_PUBLIC_GEOCODER_PROVIDER"
) as GeocoderProvider;
const provider: GeocoderProvider = (() => {
  if (requestedProvider === "google") {
    return GOOGLE_KEY ? "google" : "nominatim";
  }

  if (requestedProvider === "yandex") {
    return YANDEX_KEY ? "yandex" : "nominatim";
  }

  if (requestedProvider === "nominatim") {
    return "nominatim";
  }

  return YANDEX_KEY ? "yandex" : "nominatim";
})();

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  if (provider === "yandex") {
    if (!YANDEX_KEY) {
      throw new Error("Не задан ключ Yandex Geocoder API");
    }

    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_KEY}&format=json&geocode=${lng},${lat}`
    );

    if (!response.ok) {
      throw new Error("Ошибка запроса к Yandex Geocoder");
    }

    const data = await response.json();
    const collection = data?.response?.GeoObjectCollection?.featureMember ?? [];
    const firstResult = collection[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.text;

    if (!firstResult) {
      throw new Error("Адрес не найден");
    }

    return firstResult;
  }

  if (provider === "google") {
    if (!GOOGLE_KEY) {
      throw new Error("Не задан ключ Google Geocoding API");
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}&language=ru`
    );

    if (!response.ok) {
      throw new Error("Ошибка запроса к Google Geocoding API");
    }

    const data = await response.json();
    const firstResult = data?.results?.[0]?.formatted_address;

    if (!firstResult) {
      throw new Error("Адрес не найден");
    }

    return firstResult;
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`
  );

  if (!response.ok) {
    throw new Error("Ошибка запроса к бесплатному геокодеру");
  }

  const data = await response.json();
  const address = data?.display_name;

  if (!address) {
    throw new Error("Адрес не найден");
  }

  return address;
};
