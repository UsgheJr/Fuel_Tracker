export function calculateTripCost(
  distanceKm: number,
  consumptionL100Km: number,
  fuelPricePerLiter: number
): number {
  const litersConsumed = (consumptionL100Km / 100) * distanceKm;
  const totalCost = litersConsumed * fuelPricePerLiter;
  
  // Arrotondamento a 3 cifre per eccesso (es. 1.2341 -> 1.235)
  return Math.ceil(totalCost * 1000) / 1000;
}