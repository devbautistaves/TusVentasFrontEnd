// utils/format.js

export const formatMoney = (value) => {
  const num = Number(value);
  return isNaN(num) ? '—' : `$${Number(num || 0).toFixed(2)}`;
};

export const formatPercentage = (value) => {
  const num = Number(value);
  return isNaN(num) ? '—' : `${(num * 100).toFixed(1)}%`;
};