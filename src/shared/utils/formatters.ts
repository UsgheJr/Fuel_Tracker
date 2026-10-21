// src/shared/utils/formatters.ts

/**
 * Formatta una data ISO in formato italiano solo Data (DD/MM/YYYY).
 */
export function formatDate(dateString?: string): string {
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
 * Formatta una data ISO nel formato italiano Data e Ora (DD/MM/YYYY HH:mm).
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Formatta un importo numerico in valuta Euro (€).
 */
export function formatCurrency(amount?: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0,00 €';
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}