import React from "react";
import { IoFlashOutline, IoScaleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";

export const StoreStartPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ScreenBackground>
      <section className="card hero-card">
        <div className="hero-icon">
          <IoFlashOutline size={26} />
        </div>
        <h1 className="section-title">Быстрая доставка из любимых магазинов</h1>
        <p className="section-text">
          Выбирайте магазины, собирайте корзину и оформляйте заказ за пару минут.
        </p>
        <div className="chip-row">
          <span className="chip">
            <IoScaleOutline size={14} />
            Лимит веса 1 кг
          </span>
        </div>
        <div className="hero-action">
          <PrimaryButton
            title="Выбрать магазин"
            onClick={() => navigate("/stores/picker")}
          />
        </div>
      </section>
    </ScreenBackground>
  );
};
