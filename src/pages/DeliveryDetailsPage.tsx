import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { sendOrderByEmail } from "../services/email";
import { hasInternetConnection } from "../services/network";
import { useAppStore } from "../store/useAppStore";
import {
  formatWeight,
  getCartTotalWeightKg,
  MAX_DELIVERY_WEIGHT_KG
} from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";
import { getStoresSummary, getUniqueStoreIds } from "../utils/storeSummary";

export const DeliveryDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const [apartment, setApartment] = useState("");
  const [floor, setFloor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cart = useAppStore((state) => state.cart);
  const deliveryLocation = useAppStore((state) => state.deliveryLocation);
  const resetAfterOrder = useAppStore((state) => state.resetAfterOrder);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const totalWeightKg = useMemo(() => getCartTotalWeightKg(cart), [cart]);
  const isOverweight = totalWeightKg > MAX_DELIVERY_WEIGHT_KG;
  const storeSummary = useMemo(() => getStoresSummary(cart), [cart]);
  const uniqueStoreIds = useMemo(() => getUniqueStoreIds(cart), [cart]);

  const submitOrder = async () => {
    if (!deliveryLocation) {
      window.alert("Сначала выберите точку доставки на карте.");
      navigate("/cart/map");
      return;
    }

    if (cart.length === 0) {
      window.alert("Корзина пуста.");
      navigate("/cart");
      return;
    }

    if (!apartment.trim() || !floor.trim()) {
      window.alert("Заполните квартиру и этаж.");
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

    const hasInternet = await hasInternetConnection();
    if (!hasInternet) {
      window.alert("Нет интернета. Проверьте подключение.");
      return;
    }

    try {
      setSubmitting(true);
      const detailedAddress =
        `${deliveryLocation.address}. ` +
        `Квартира: ${apartment.trim()}, этаж: ${floor.trim()}`;

      await sendOrderByEmail({
        storeName: storeSummary,
        cart,
        total,
        location: {
          lat: deliveryLocation.lat,
          lng: deliveryLocation.lng,
          address: detailedAddress
        }
      });

      resetAfterOrder();
      window.alert("Заказ отправлен");
      navigate("/cart");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось отправить заказ";
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <div className="page-nav">
        <BackButton fallbackTo="/cart/map" />
      </div>

      <section className="card section-card">
        <h1 className="section-title">Детали доставки</h1>
        <p className="section-text">
          Подтвердите адрес и укажите данные для курьера.
        </p>
        <div className="summary-grid map-summary-grid">
          <div>
            <span className="muted">Адрес</span>
            <strong>{deliveryLocation?.address ?? "Точка не выбрана"}</strong>
          </div>
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

        <input
          className="search-input"
          value={apartment}
          onChange={(event) =>
            setApartment(event.target.value.replace(/\D+/g, ""))
          }
          placeholder="Квартира"
          inputMode="numeric"
        />
        <input
          className="search-input"
          value={floor}
          onChange={(event) => setFloor(event.target.value.replace(/\D+/g, ""))}
          placeholder="Этаж"
          inputMode="numeric"
        />

        <div className="hero-action">
          <PrimaryButton
            title={submitting ? "Отправляем..." : "Подтвердить и отправить"}
            onClick={submitOrder}
            disabled={submitting || !deliveryLocation}
          />
        </div>
      </section>
    </ScreenBackground>
  );
};
