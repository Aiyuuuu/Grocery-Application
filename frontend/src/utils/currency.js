export function formatPKR(value) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? Math.round(amount) : 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safeAmount);
}
