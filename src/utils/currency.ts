export const formatCurrency = (value: number): string =>
  `${value.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} ₽`;
