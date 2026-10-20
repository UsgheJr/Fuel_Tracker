// src/features/trips/services/tripCostCalculator.ts

import type { RefuelBox } from '../../../shared/types';

/**
 * Calcola il costo stimato di un viaggio in base alla distanza e al prezzo medio del carburante.
 */
export function calculateTripCost(
  distanceKm: number,
  averageConsumptionLitersPer100Km: number,
  averagePricePerLiter: number
): number {
  if (distanceKm <= 0 || averageConsumptionLitersPer100Km <= 0 || averagePricePerLiter <= 0) {
    return 0;
  }

  const litersNeeded = (distanceKm * averageConsumptionLitersPer100Km) / 100;
  const totalCost = litersNeeded * averagePricePerLiter;
  
  return Number(totalCost.toFixed(2));
}

/**
 * Estrae il prezzo medio al litro dai rifornimenti recenti registrati dall'utente.
 */
export function getAveragePricePerLiter(refuelBoxes: RefuelBox[]): number {
  if (!refuelBoxes || refuelBoxes.length === 0) return 1.859; // Fallback di sicurezza

  let totalSpent = 0;
  let totalLiters = 0;

  for (const box of refuelBoxes) {
    const spent = box.spent_amount ?? (box.liters * box.price_per_liter);
    totalSpent += spent;
    totalLiters += box.liters ?? 0;
  }

  if (totalLiters === 0) return 1.859;

  return Number((totalSpent / totalLiters).toFixed(3));
}