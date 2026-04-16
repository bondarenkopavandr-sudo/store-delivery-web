import React from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";

type BackButtonProps = {
  fallbackTo: string;
};

export const BackButton: React.FC<BackButtonProps> = ({ fallbackTo }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const onBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (location.pathname !== fallbackTo) {
      navigate(fallbackTo, { replace: true });
    }
  };

  return (
    <button type="button" className="back-button" onClick={onBack}>
      <IoArrowBackOutline size={16} />
      Назад
    </button>
  );
};
