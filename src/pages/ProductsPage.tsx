import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { PRODUCTS } from "../data/products";
import { STORES } from "../data/stores";
import { useAppStore } from "../store/useAppStore";
import {
  formatWeight,
  getCartTotalWeightKg,
  MAX_DELIVERY_WEIGHT_KG
} from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedStoreId = useAppStore((state) => state.selectedStoreId);
  const selectedStoreName = useAppStore((state) => state.selectedStoreName);
  const cart = useAppStore((state) => state.cart);
  const setStore = useAppStore((state) => state.setStore);
  const addToCart = useAppStore((state) => state.addToCart);
  const decreaseCartItem = useAppStore((state) => state.decreaseCartItem);
  const [storeQuery, setStoreQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setStoreQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const storeProducts = useMemo(
    () => PRODUCTS.filter((product) => product.storeId === selectedStoreId),
    [selectedStoreId]
  );
  const normalizedStoreQuery = storeQuery.trim().toLowerCase();
  const filteredStoreProducts = useMemo(() => {
    if (!normalizedStoreQuery) {
      return storeProducts;
    }

    return storeProducts.filter((product) =>
      product.name.toLowerCase().includes(normalizedStoreQuery)
    );
  }, [normalizedStoreQuery, storeProducts]);

  const alternativeStores = useMemo(() => {
    if (!normalizedStoreQuery || filteredStoreProducts.length > 0) {
      return [];
    }

    const storeCountMap = new Map<string, number>();
    for (const product of PRODUCTS) {
      if (
        product.storeId !== selectedStoreId &&
        product.name.toLowerCase().includes(normalizedStoreQuery)
      ) {
        storeCountMap.set(product.storeId, (storeCountMap.get(product.storeId) ?? 0) + 1);
      }
    }

    return Array.from(storeCountMap.entries())
      .map(([storeId, count]) => {
        const store = STORES.find((candidate) => candidate.id === storeId);
        if (!store) {
          return null;
        }

        return {
          storeId: store.id,
          storeName: store.name,
          logoUrl: store.logoUrl,
          count
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.count - a.count);
  }, [filteredStoreProducts.length, normalizedStoreQuery, selectedStoreId]);

  const totalWeight = getCartTotalWeightKg(cart);
  const progress = Math.min((totalWeight / MAX_DELIVERY_WEIGHT_KG) * 100, 100);
  const isOverweight = totalWeight > MAX_DELIVERY_WEIGHT_KG;

  if (!selectedStoreId) {
    return (
      <ScreenBackground>
        <div className="page-nav">
          <BackButton fallbackTo="/stores/picker" />
        </div>

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
      <div className="page-nav">
        <BackButton fallbackTo="/stores/picker" />
      </div>

      <section className="card section-card">
        <h1 className="section-title">{selectedStoreName}</h1>
        <p className="section-text">
          Вес корзины: {formatWeight(totalWeight)} / {formatWeight(MAX_DELIVERY_WEIGHT_KG)}
        </p>
        <input
          className="search-input search-input--compact"
          value={storeQuery}
          onChange={(event) => setStoreQuery(event.target.value)}
          placeholder="Поиск в выбранном магазине..."
        />
        <div className="weight-track">
          <div
            className={`weight-fill ${isOverweight ? "weight-fill--danger" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <section className="products-list">
        {filteredStoreProducts.map((item) => {
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

      {normalizedStoreQuery && filteredStoreProducts.length === 0 ? (
        <section className="card section-card">
          <h2 className="sub-title">В этом магазине не найдено</h2>
          {alternativeStores.length > 0 ? (
            <>
              <p className="section-text">Есть в этих магазинах:</p>
              <div className="alternative-stores">
                {alternativeStores.map((store) => (
                  <button
                    key={store.storeId}
                    type="button"
                    className="alternative-store"
                    onClick={() => {
                      setStore(store.storeId, store.storeName);
                    }}
                  >
                    <img src={store.logoUrl} alt={store.storeName} />
                    <div>
                      <strong>{store.storeName}</strong>
                      <div className="muted">Подходящих товаров: {store.count}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="notice notice--neutral">Похожих товаров нет и в других магазинах.</div>
          )}
        </section>
      ) : null}
    </ScreenBackground>
  );
};
