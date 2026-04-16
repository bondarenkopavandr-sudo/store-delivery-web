import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEnv } from "../config/env";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { reverseGeocode } from "../services/geocoding";
import { useAppStore } from "../store/useAppStore";
import {
  formatWeight,
  getCartTotalWeightKg,
  MAX_DELIVERY_WEIGHT_KG
} from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";
import { getStoresSummary, getUniqueStoreIds } from "../utils/storeSummary";

type YandexMapApi = {
  ready: (callback: () => void) => void;
  Map: new (
    container: HTMLElement,
    state: { center: [number, number]; zoom: number; controls?: string[] },
    options?: Record<string, unknown>
  ) => YandexMapInstance;
  Placemark: new (
    coordinates: [number, number],
    properties?: Record<string, unknown>,
    options?: Record<string, unknown>
  ) => YandexPlacemarkInstance;
};

type YandexMapInstance = {
  destroy: () => void;
  setCenter: (coordinates: [number, number], zoom?: number) => void;
  events: {
    add: (eventName: string, handler: (event: { get: (name: string) => unknown }) => void) => void;
  };
  geoObjects: {
    add: (geoObject: unknown) => void;
  };
};

type YandexPlacemarkInstance = {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
  geometry: {
    getCoordinates: () => [number, number];
    setCoordinates: (coordinates: [number, number]) => void;
  };
};

declare global {
  interface Window {
    ymaps?: YandexMapApi;
  }
}

type Position = {
  lat: number;
  lng: number;
};

const DEFAULT_POSITION: Position = {
  lat: 55.751244,
  lng: 37.618423
};

const YMAPS_SCRIPT_ID = "yandex-maps-js-api";
const YANDEX_MAPS_KEY = getEnv(
  "VITE_YANDEX_MAPS_API_KEY",
  "EXPO_PUBLIC_YANDEX_MAPS_API_KEY"
);

const loadYandexMaps = (): Promise<YandexMapApi> =>
  new Promise((resolve, reject) => {
    if (!YANDEX_MAPS_KEY) {
      reject(
        new Error(
          "Не задан VITE_YANDEX_MAPS_API_KEY. Добавьте ключ Яндекс Карт в .env и перезапустите сайт."
        )
      );
      return;
    }

    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps as YandexMapApi));
      return;
    }

    const existingScript = document.getElementById(YMAPS_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    const onReady = () => {
      if (!window.ymaps) {
        reject(new Error("API Яндекс Карт не инициализировано"));
        return;
      }

      window.ymaps.ready(() => resolve(window.ymaps as YandexMapApi));
    };

    if (existingScript) {
      existingScript.addEventListener("load", onReady, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Не удалось загрузить скрипт Яндекс Карт")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    const keyPart = YANDEX_MAPS_KEY ? `apikey=${encodeURIComponent(YANDEX_MAPS_KEY)}&` : "";
    script.id = YMAPS_SCRIPT_ID;
    script.src = `https://api-maps.yandex.ru/2.1/?${keyPart}lang=ru_RU`;
    script.async = true;
    script.onload = onReady;
    script.onerror = () =>
      reject(new Error("Не удалось загрузить Яндекс Карты. Проверьте API ключ."));
    document.head.appendChild(script);
  });

export const DeliveryMapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YandexMapInstance | null>(null);
  const placemarkRef = useRef<YandexPlacemarkInstance | null>(null);
  const positionRef = useRef<Position>(DEFAULT_POSITION);

  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [address, setAddress] = useState<string>("Определяем адрес...");
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  const cart = useAppStore((state) => state.cart);
  const setDeliveryLocation = useAppStore((state) => state.setDeliveryLocation);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const totalWeightKg = useMemo(() => getCartTotalWeightKg(cart), [cart]);
  const isOverweight = totalWeightKg > MAX_DELIVERY_WEIGHT_KG;
  const storeSummary = useMemo(() => getStoresSummary(cart), [cart]);
  const uniqueStoreIds = useMemo(() => getUniqueStoreIds(cart), [cart]);

  const updateAddress = useCallback(async (lat: number, lng: number) => {
    setLoadingAddress(true);
    try {
      const decodedAddress = await reverseGeocode(lat, lng);
      setAddress(decodedAddress);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось определить адрес";
      setAddress("Адрес недоступен");
      window.alert(message);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        const ymaps = await loadYandexMaps();
        if (!isMounted || !mapElementRef.current) {
          return;
        }

        const startPoint: [number, number] = [
          positionRef.current.lat,
          positionRef.current.lng
        ];
        const map = new ymaps.Map(
          mapElementRef.current,
          {
            center: startPoint,
            zoom: 15,
            controls: ["zoomControl", "fullscreenControl"]
          },
          {
            suppressMapOpenBlock: true
          }
        );

        const placemark = new ymaps.Placemark(
          startPoint,
          {},
          {
            draggable: true,
            preset: "islands#redDotIcon"
          }
        );

        placemark.events.add("dragend", () => {
          const coordinates = placemark.geometry.getCoordinates();
          const next = { lat: coordinates[0], lng: coordinates[1] };
          setPosition(next);
          void updateAddress(next.lat, next.lng);
        });

        map.events.add("click", (event) => {
          const coordinates = event.get("coords") as [number, number] | undefined;
          if (!coordinates) {
            return;
          }

          placemark.geometry.setCoordinates(coordinates);
          const next = { lat: coordinates[0], lng: coordinates[1] };
          setPosition(next);
          void updateAddress(next.lat, next.lng);
        });

        map.geoObjects.add(placemark);
        mapRef.current = map;
        placemarkRef.current = placemark;
        setMapLoadError(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не удалось загрузить карту. Проверьте интернет и API ключ.";
        setMapLoadError(message);
        setLoadingAddress(false);
      }
    };

    void initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      placemarkRef.current = null;
    };
  }, [updateAddress]);

  useEffect(() => {
    if (!navigator.geolocation) {
      void updateAddress(DEFAULT_POSITION.lat, DEFAULT_POSITION.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (geo) => {
        const nextPosition = {
          lat: geo.coords.latitude,
          lng: geo.coords.longitude
        };
        setPosition(nextPosition);
        await updateAddress(nextPosition.lat, nextPosition.lng);
      },
      async () => {
        await updateAddress(DEFAULT_POSITION.lat, DEFAULT_POSITION.lng);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000
      }
    );
  }, [updateAddress]);

  useEffect(() => {
    positionRef.current = position;

    if (!mapRef.current || !placemarkRef.current) {
      return;
    }

    const nextCoords: [number, number] = [position.lat, position.lng];
    placemarkRef.current.geometry.setCoordinates(nextCoords);
    mapRef.current.setCenter(nextCoords);
  }, [position]);

  const confirmOrder = () => {
    if (cart.length === 0) {
      window.alert("Корзина пуста.");
      return;
    }

    if (isOverweight) {
      window.alert("Вес доставки превышает 1 кг. Уменьшите корзину.");
      return;
    }

    if (uniqueStoreIds.length > 1) {
      window.alert(
        "В корзине товары из нескольких магазинов. Дрон не может забрать заказ из двух магазинов за один рейс. Пожалуйста, оформите отдельный второй заказ."
      );
      navigate("/cart");
      return;
    }

    setDeliveryLocation({
      lat: position.lat,
      lng: position.lng,
      address
    });
    navigate("/cart/details");
  };

  return (
    <div className="map-layout">
      <div className="map-close">
        <BackButton fallbackTo="/cart" />
      </div>

      <div ref={mapElementRef} className="map-canvas" />

      <section className="card map-panel">
        <strong>Точка доставки</strong>
        {mapLoadError && <div className="notice">{mapLoadError}</div>}
        <div className="muted map-address">
          {loadingAddress ? "Получаем адрес..." : address}
        </div>
        <div className="muted">
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </div>

        <div className="summary-grid map-summary-grid">
          <div>
            <span className="muted">Магазины</span>
            <strong>{storeSummary}</strong>
          </div>
          <div>
            <span className="muted">Сумма</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
          <div>
            <span className="muted">Вес</span>
            <strong>{formatWeight(totalWeightKg)}</strong>
          </div>
        </div>

        {isOverweight && (
          <div className="notice">Вес доставки превышает 1 кг. Уберите часть товаров.</div>
        )}

        <div className="map-action">
          <PrimaryButton
            title="Подтвердить точку"
            onClick={confirmOrder}
            disabled={loadingAddress || cart.length === 0 || !!mapLoadError}
          />
        </div>
      </section>
    </div>
  );
};
