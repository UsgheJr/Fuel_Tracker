export function calculateTripCost(
  distanceKm: number,
  consumption: number,
  fuelPricePerLiter: number,
  unit: 'l/100km' | 'l/km' = 'l/100km'
): number {
  let litersConsumed = 0;

  if (unit === 'l/km') {
    // Calcolo diretto: litri consumati = distanza in km * consumo in l/km
    litersConsumed = distanceKm * consumption;
  } else {
    // Calcolo standard: litri consumati = (consumo / 100) * distanza in km
    litersConsumed = (consumption / 100) * distanceKm;
  }

  const totalCost = litersConsumed * fuelPricePerLiter;
  
  // Arrotondamento a 3 cifre per eccesso
  return Math.ceil(totalCost * 1000) / 1000;
}