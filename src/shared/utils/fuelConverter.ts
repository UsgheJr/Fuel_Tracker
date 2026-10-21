import type { ConsumptionUnit } from '../types';

const DEFAULT_LITERS_PER_100KM = 6.67; // ~15 km/l

/**
 * Normalizza qualsiasi valore di consumo nell'unità standard interna (l/100km).
 */
export function normalizeToLitersPer100Km(
  value?: number,
  unit: ConsumptionUnit = 'l/100km'
): number {
  if (!value || value <= 0) return DEFAULT_LITERS_PER_100KM;

  // Se espresso in km/l (es. 15 km/l) -> 100 / 15 = 6.67 l/100km
  if (unit === 'km/l') {
    return Number((100 / value).toFixed(2));
  }

  // Se espresso in l/km (es. 0.0667 l/km) -> 0.0667 * 100 = 6.67 l/100km
  if (unit === 'l/km') {
    return Number((value * 100).toFixed(2));
  }

  // Standard l/100km
  return Number(value.toFixed(2));
}

/**
 * Calcola i litri effettivi necessari per un viaggio in base a distanza, valore di efficienza e unità.
 */
export function calculateFuelNeeded(
  distanceKm: number,
  efficiencyValue?: number,
  unit: ConsumptionUnit = 'l/100km'
): number {
  if (distanceKm <= 0) return 0;
  const litersPer100Km = normalizeToLitersPer100Km(efficiencyValue, unit);
  return (distanceKm * litersPer100Km) / 100;
}