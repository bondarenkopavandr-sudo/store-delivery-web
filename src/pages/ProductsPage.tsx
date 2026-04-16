import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { PRODUCTS } from "../data/products";
import { useAppStore } from "../store/useAppStore";
import {
  formatWeight,
  getCartTotalWeightKg,
  MAX_DELIVERY_WEIGHT_KG
} from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const selectedStoreId = useAppStore((state) => state.selectedStoreId);
  const selectedStoreName = useAppStore((state) => state.selectedStoreName);
  const cart = useAppStore((state) => state.cart);
  const addToCart = useAppStore((state) => state.addToCart);
  const decreaseCartItem = useAppStore((state) => state.decreaseCartItem);

  const storeProducts = useMemo(
    () => PRODUCTS.filter((product) => product.storeId === selectedStoreId),
    [selectedStoreId]
  );

  const totalWeight = getCartTotalWeightKg(cart);
  const progress = Math.min((totalWeight / MAX_DELIVERY_WEIGHT_KG) * 100, 100);
  const isOverweight = totalWeight > MAX_DELIVERY_WEIGHT_KG;

  if (!selectedStoreId) {
    return (
      <ScreenBackground>
        <section className="card section-card">
          <h1 className="section-title">Сначала выберите магазин</h1>
          <div className="hero-action">
            <PrimaryButton title="Перейти к магазинам" onClick={() => navigate("/stores/picker")} />
          </div>
        </section>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <section className="card section-card">
        <h1 className="section-title">{selectedStoreName}</h1>
        <p className="section-text">
          Вес корзины: {formatWeight(totalWeight)} / {formatWeight(MAX_DELIVERY_WEIGHT_KG)}
        </p>
        <div className="weight-track">
          <div
            className={`weight-fill ${isOverweight ? "weight-fill--danger" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="products-list">
        {storeProducts.map((item) => {
          const cartItem = cart.find((row) => row.id === item.id);
          const quantity = cartItem?.quantity ?? 0;

          return (
            <article key={item.id} className="card product-card">
              <div className="row space-between product-row">
                <div className="product-info">
                  <strong className="product-name">{item.name}</strong>
                  <div className="product-price">{formatCurrency(item.price)}</div>
                  <div className="muted">Вес: {formatWeight(item.weightKg)}</div>
                </div>

                {quantity > 0 ? (
                  <div className="counter">
                    <button
                      type="button"
                      className="counter__btn"
                      onClick={() => decreaseCartItem(item.id)}
                    >
                      -
                    </button>
                    <span className="counter__value">{quantity}</span>
                    <button
                      type="button"
                      className="counter__btn"
                      onClick={() => addToCart(item)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <PrimaryButton title="Добавить" onClick={() => addToCart(item)} variant="secondary" />
                )}
              </div>
            </article>
          );
        })}
      </section>
    </ScreenBackground>
  );
};
