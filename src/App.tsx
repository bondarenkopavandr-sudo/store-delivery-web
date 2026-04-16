import React from "react";
import { IoCartOutline, IoStorefrontOutline } from "react-icons/io5";
import { NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CartPage } from "./pages/CartPage";
import { DeliveryMapPage } from "./pages/DeliveryMapPage";
import { ProductsPage } from "./pages/ProductsPage";
import { StorePickerPage } from "./pages/StorePickerPage";
import { StoreStartPage } from "./pages/StoreStartPage";

const tabs = [
  { to: "/stores/start", label: "Магазины", icon: <IoStorefrontOutline size={18} /> },
  { to: "/cart", label: "Корзина", icon: <IoCartOutline size={18} /> }
];

export const App: React.FC = () => {
  const location = useLocation();
  const isMapRoute = location.pathname === "/cart/map";

  return (
    <div className="app-shell">
      <main className={`screen-wrap ${isMapRoute ? "screen-wrap--map" : ""}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/stores/start" replace />} />
          <Route path="/stores/start" element={<StoreStartPage />} />
          <Route path="/stores/picker" element={<StorePickerPage />} />
          <Route path="/stores/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/cart/map" element={<DeliveryMapPage />} />
          <Route path="*" element={<Navigate to="/stores/start" replace />} />
        </Routes>
      </main>

      {!isMapRoute && (
        <nav className="tabbar">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `tabbar__item ${isActive ? "tabbar__item--active" : ""}`
              }
            >
              <span className="tabbar__icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
};
