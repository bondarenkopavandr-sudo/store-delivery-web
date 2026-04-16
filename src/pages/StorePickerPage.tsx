import React, { useMemo, useState } from "react";
import {
  IoBasketOutline,
  IoCartOutline,
  IoColorWandOutline,
  IoCubeOutline,
  IoDocumentTextOutline,
  IoMedkitOutline,
  IoPricetagsOutline,
  IoSparklesOutline,
  IoStorefrontOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { BackButton } from "../components/BackButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { PRODUCTS } from "../data/products";
import { STORES } from "../data/stores";
import { useAppStore } from "../store/useAppStore";
import { StoreIconName } from "../types/models";
import { formatWeight } from "../utils/cartWeight";
import { formatCurrency } from "../utils/currency";

const iconMap: Record<StoreIconName, React.ReactNode> = {
  "storefront-outline": <IoStorefrontOutline size={22} />,
  "basket-outline": <IoBasketOutline size={22} />,
  "cube-outline": <IoCubeOutline size={22} />,
  "cart-outline": <IoCartOutline size={22} />,
  "pricetags-outline": <IoPricetagsOutline size={22} />,
  "sparkles-outline": <IoSparklesOutline size={22} />,
  "color-wand-outline": <IoColorWandOutline size={22} />,
  "medkit-outline": <IoMedkitOutline size={22} />,
  "document-text-outline": <IoDocumentTextOutline size={22} />
};

export const StorePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const setStore = useAppStore((state) => state.setStore);
  const [globalQuery, setGlobalQuery] = useState("");

  const normalizedGlobalQuery = globalQuery.trim().toLowerCase();
  const storeById = useMemo(
    () =>
      STORES.reduce<Record<string, (typeof STORES)[number]>>((acc, store) => {
        acc[store.id] = store;
        return acc;
      }, {}),
    []
  );
  const globalResults = useMemo(() => {
    if (!normalizedGlobalQuery) {
      return [];
    }

    return PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(normalizedGlobalQuery)
    ).slice(0, 24);
  }, [normalizedGlobalQuery]);

  return (
    <ScreenBackground>
      <div className="page-nav">
        <BackButton fallbackTo="/stores/start" />
      </div>

      <section className="card section-card">
        <h1 className="section-title">Выберите магазин</h1>
        <div className="section-meta">Доступно магазинов: {STORES.length}</div>
      </section>

      <section className="card section-card">
        <h2 className="sub-title">Поиск среди всех магазинов</h2>
        <input
          className="search-input"
          value={globalQuery}
          onChange={(event) => setGlobalQuery(event.target.value)}
          placeholder="Например: сыр, шампунь, бумага A4..."
        />

        {normalizedGlobalQuery ? (
          globalResults.length > 0 ? (
            <div className="global-results">
              {globalResults.map((product) => {
                const store = storeById[product.storeId];
                return (
                  <div key={product.id} className="global-result-item">
                    <div className="global-result-info">
                      <strong>{product.name}</strong>
                      <span className="muted">
                        {formatCurrency(product.price)} · {formatWeight(product.weightKg)}
                      </span>
                      <span className="global-result-store">
                        Есть в магазине: {store?.name ?? product.storeId}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mini-button"
                      onClick={() => {
                        if (!store) {
                          return;
                        }
                        setStore(store.id, store.name);
                        navigate(`/stores/products?q=${encodeURIComponent(product.name)}`);
                      }}
                    >
                      Открыть
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="notice notice--neutral">
              Ничего не нашли. Попробуйте другое название товара.
            </div>
          )
        ) : null}
      </section>

      <div className="stores-grid">
        {STORES.map((store) => (
          <button
            key={store.id}
            type="button"
            className="card store-card"
            onClick={() => {
              setStore(store.id, store.name);
              navigate("/stores/products");
            }}
          >
            <div className="store-card__icon">
              <img
                src={store.logoUrl}
                alt={`Логотип ${store.name}`}
                loading="lazy"
                className="store-card__logo"
              />
            </div>
            <div className="store-card__tiny-icon">{iconMap[store.icon]}</div>
            <strong className="store-card__title">{store.name}</strong>
            <span className="muted">Открыть каталог</span>
          </button>
        ))}
      </div>
    </ScreenBackground>
  );
};
