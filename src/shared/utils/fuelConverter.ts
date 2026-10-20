// src/shared/utils/fuelConverters.ts

import type { ConsumptionUnit } from '../types';

const DEFAULT_LITERS_PER_100KM = 6.67; // Equivalente a circa 15 km/l

/**
 * Converte qualsiasi unità di misura inserita dall'utente in litri per 100 km (standard di calcolo interno).
 */
export function normalizeToLitersPer100Km(
  value?: number, 
  unit?: ConsumptionUnit
): number {
  if (!value || value <= 0) return DEFAULT_LITERS_PER_100KM;

  // Se l'utente ha inserito km/l (es. 15 km/l), lo convertiamo in l/100km -> (100 / 15) = 6.67 l/100km
  if (unit === 'l/km' || unit === 'km/l') {
    return Number((100 / value).toFixed(2));
  }

  // Altrimenti consideriamo già l'unità standard 'l/100km'
  return Number(value.toFixed(2));
}

/**
 * Calcola i litri effettivi consumati per un viaggio in base alla distanza e all'efficienza.
 */
export function calculateFuelNeeded(
  distanceKm: number,
  efficiencyValue?: number,
  unit?: ConsumptionUnit
): number {
  if (distanceKm <= 0) return 0;

  const litersPer100Km = normalizeToLitersPer100Km(efficiencyValue, unit);
  const litersNeeded = (distanceKm * litersPer100Km) / 100;

  return Number(litersNeeded.toFixed(3));
}