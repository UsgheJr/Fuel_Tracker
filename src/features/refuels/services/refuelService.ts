// src/features/refuels/services/refuelService.ts

/**
 * Calcola i litri di carburante a partire dall'importo speso e dal prezzo al litro.
 */
export function calculateLitersFromSpent(spentAmount: number, pricePerLiter: number): number {
  if (spentAmount <= 0 || pricePerLiter <= 0) return 0;
  return Number((spentAmount / pricePerLiter).toFixed(3));
}

/**
 * Calcola l'importo speso a partire dai litri e dal prezzo al litro.
 */
export function calculateSpentFromLiters(liters: number, pricePerLiter: number): number {
  if (liters <= 0 || pricePerLiter <= 0) return 0;
  return Number((liters * pricePerLiter).toFixed(2));
}