import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { useAppStore } from "../store/useAppStore";
import {
  formatWeight,
  getCartTotalWeightKg,
  MAX_DELIVERY_WEIGHT_KG
} from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";
import { getStoresSummary } from "../utils/storeSummary";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();

  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);
  const decreaseCartItem = useAppStore((state) => state.decreaseCartItem);
  const clearCart = useAppStore((state) => state.clearCart);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const totalWeightKg = useMemo(() => getCartTotalWeightKg(cart), [cart]);
  const remainingWeightKg = Math.max(MAX_DELIVERY_WEIGHT_KG - totalWeightKg, 0);
  const isOverweight = totalWeightKg > MAX_DELIVERY_WEIGHT_KG;
  const storeSummary = useMemo(() => getStoresSummary(cart), [cart]);
  const isEmpty = cart.length === 0;

  return (
    <ScreenBackground>
      <div className="page-nav">
        <BackButton fallbackTo="/stores/start" />
      </div>

      {isEmpty ? (
        <section className="card section-card section-card--center">
          <h1 className="section-title">Корзина пуста</h1>
          <p className="section-text">Добавьте товары и возвращайтесь к оформлению.</p>
          <div className="hero-action">
            <PrimaryButton title="Выбрать магазин" onClick={() => navigate("/stores/picker")} />
          </div>
        </section>
      ) : (
        <>
          <section className="card summary">
            <h2 className="summary-title">Ваш заказ</h2>
            <div className="muted summary-store-line">
              Магазины: {storeSummary}
            </div>
            <div className="summary-grid">
              <div>
                <span className="muted">Сумма</span>
                <strong>{formatCurrency(total)}</strong>
              </div>
              <div>
                <span className="muted">Вес</span>
                <strong>{formatWeight(totalWeightKg)}</strong>
              </div>
              <div>
                <span className="muted">До лимита</span>
                <strong>{formatWeight(remainingWeightKg)}</strong>
              </div>
            </div>
          </section>

          <section className="cart-list">
            {cart.map((item) => (
              <article className="card cart-card" key={item.id}>
                <div className="row space-between cart-row">
                  <div className="product-info">
                    <strong className="product-name">{item.name}</strong>
                    <div className="muted">{formatCurrency(item.price)} / шт</div>
                    <div className="muted">{formatWeight(item.weightKg)} / шт</div>
                    <div className="product-line-total">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>

                  <div className="counter">
                    <button
                      type="button"
                      className="counter__btn"
                      onClick={() => decreaseCartItem(item.id)}
                    >
                      -
                    </button>
                    <span className="counter__value">{item.quantity}</span>
                    <button
                      type="button"
                      className="counter__btn"
                      onClick={() =>
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          weightKg: item.weightKg,
                          storeId: item.storeId
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {isOverweight && (
            <div className="notice">Вес доставки превышает 1 кг. Уберите часть товаров.</div>
          )}
        </>
      )}

      <div className="footer-actions">
        <PrimaryButton
          title="Очистить корзину"
          variant="danger"
          disabled={isEmpty}
          onClick={() => {
            clearCart();
            window.alert("Корзина очищена");
          }}
        />
        <PrimaryButton
          title="Выбрать место доставки"
          disabled={isEmpty}
          onClick={() => navigate("/cart/map")}
        />
      </div>
    </ScreenBackground>
  );
};
