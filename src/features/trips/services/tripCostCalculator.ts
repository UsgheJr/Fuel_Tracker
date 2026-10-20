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
export function getAveragePricePerLiter(refuels: RefuelBox[]): number {
  if (!refuels || refuels.length === 0) return 0;

  const totalCost = refuels.reduce((acc, curr) => acc + curr.spent_amount, 0);
  const totalLiters = refuels.reduce((acc, curr) => acc + curr.liters, 0);

  if (totalLiters === 0) return 0;

  return Number((totalCost / totalLiters).toFixed(3));
}