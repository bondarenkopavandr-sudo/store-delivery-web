import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger";

type PrimaryButtonProps = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  className?: string;
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onClick,
  disabled = false,
  variant = "primary",
  className
}) => (
  <button
    type="button"
    className={`button button--${variant} ${className ?? ""}`.trim()}
    onClick={onClick}
    disabled={disabled}
  >
    {title}
  </button>
);
