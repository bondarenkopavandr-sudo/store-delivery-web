import React from "react";
import {
  IoBasketOutline,
  IoCartOutline,
  IoCubeOutline,
  IoDocumentTextOutline,
  IoMedkitOutline,
  IoPricetagsOutline,
  IoSparklesOutline,
  IoStorefrontOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { ScreenBackground } from "../components/ScreenBackground";
import { STORES } from "../data/stores";
import { useAppStore } from "../store/useAppStore";
import { StoreIconName } from "../types/models";

const iconMap: Record<StoreIconName, React.ReactNode> = {
  "storefront-outline": <IoStorefrontOutline size={22} />,
  "basket-outline": <IoBasketOutline size={22} />,
  "cube-outline": <IoCubeOutline size={22} />,
  "cart-outline": <IoCartOutline size={22} />,
  "pricetags-outline": <IoPricetagsOutline size={22} />,
  "sparkles-outline": <IoSparklesOutline size={22} />,
  "medkit-outline": <IoMedkitOutline size={22} />,
  "document-text-outline": <IoDocumentTextOutline size={22} />
};

export const StorePickerPage: React.FC = () => {
  const navigate = useNavigate();
  const setStore = useAppStore((state) => state.setStore);

  return (
    <ScreenBackground>
      <section className="card section-card">
        <h1 className="section-title">Выберите магазин</h1>
        <p className="section-text">
          Можно добавлять товары из нескольких магазинов в одну корзину.
        </p>
        <div className="section-meta">Доступно магазинов: {STORES.length}</div>
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
            <div className="store-card__icon">{iconMap[store.icon]}</div>
            <strong className="store-card__title">{store.name}</strong>
            <span className="muted">Открыть каталог</span>
          </button>
        ))}
      </div>
    </ScreenBackground>
  );
};
