// src/features/trips/services/tripCostCalculator.ts
export function calculateTripCost(
  distanceKm: number,
  consumptionL100Km: number,
  fuelPricePerLiter: number
): number {
  // Formula: (Consumo medio / 100) * Distanza * Prezzo Benzina
  const litersConsumed = (consumptionL100Km / 100) * distanceKm;
  const totalCost = litersConsumed * fuelPricePerLiter;
  
  // Arrotondamento a 2 decimali
  return Math.round(totalCost * 100) / 100;
}