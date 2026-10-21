// src/shared/utils/parseCsvTrips.ts

import type { Trip } from '../types';
import type { TripCategory } from '../types/categories';

/**
 * Pulisce l'indirizzo rimuovendo indicazioni di provincia e nazione ridondanti.
 */
export function cleanAddress(fullAddress: string): string {
  if (!fullAddress || fullAddress.trim() === '') return 'Indirizzo non specificato';
  try {
    let cleaned = fullAddress.replace(/provincia di.*$/i, '').trim();
    cleaned = cleaned.replace(/,\s*$/, '');
    return cleaned;
  } catch {
    return fullAddress;
  }
}

/**
 * Converte in modo sicuro stringhe numeriche con virgola o punto in float.
 */
function parseItalianNumber(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const sanitized = String(val).replace(',', '.').trim();
  const parsed = parseFloat(sanitized);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Analizza una singola riga array estratta da PapaParse (header: false).
 * Mappatura posizionale rigorosa:
 * [0] Partenza Address | [1] Departure Time ISO | [2] Destinazione Address | [3] Arrival Time ISO
 * [4] Distanza (km)    | [5] Consumo (l/100km)  | [6] Categoria
 */
export function parseTripCsvRowArray(row: string[], currentUserId: string): Trip | null {
  if (!row || row.length < 5) return null;

  const rawDepAddress = row[0] || '';
  const departureIso = row[1] && row[1].includes('T') ? row[1].trim() : new Date().toISOString();
  const rawArrAddress = row[2] || '';
  const arrivalIso = row[3] && row[3].includes('T') ? row[3].trim() : departureIso;

  const distanceKm = parseItalianNumber(row[4]);
  const consumptionLitersPer100Km = parseItalianNumber(row[5]);
  const category = (row[6]?.trim() as TripCategory) || 'Lavoro';

  // Salta la riga dell'intestazione o viaggi senza distanza
  if (distanceKm <= 0 || rawDepAddress.toLowerCase().includes('partenza')) {
    return null;
  }

  const departureClean = cleanAddress(rawDepAddress);
  const arrivalClean = cleanAddress(rawArrAddress);

  return {
    id: crypto.randomUUID(),
    user_id: currentUserId,
    departure_time: departureIso,
    arrival_time: arrivalIso,
    departure_address: departureClean,
    arrival_address: arrivalClean,
    distance_km: distanceKm,
    fuel_efficiency_kpl: consumptionLitersPer100Km > 0 ? consumptionLitersPer100Km : undefined,
    consumption_unit: 'l/100km',
    category: category,
    notes: `Da ${departureClean} a ${arrivalClean}`,
  };
}