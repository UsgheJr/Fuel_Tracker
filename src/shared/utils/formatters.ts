// src/shared/utils/formatters.ts

/**
 * Formatta una stringa di data nel formato italiano (DD/MM/YYYY).
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatta un valore numerico in valuta Euro (€).
 */
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '€ 0,00';

  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}