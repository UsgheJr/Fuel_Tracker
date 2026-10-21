import type { Trip } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';

export function parseTripsCsv(csvText: string, currentUserId: string): Trip[] {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length <= 1) return [];

  // Salva l'intestazione e analizza le righe
  const rows = lines.slice(1);
  const parsedTrips: Trip[] = [];

  for (const row of rows) {
    // Gestione CSV supponendo separatore virgola o punto e virgola
    const cols = row.split(/,|\;/).map(c => c.trim().replace(/^["']|["']$/g, ''));
    
    // Tracciato atteso: Partenza, Destinazione, Data, Distanza, Consumo, Categoria
    // Adattiamo in base all'ordine effettivo delle colonne nel file
    const departure = cols[0] || 'Partenza';
    const destination = cols[1] || 'Destinazione';
    const rawDate = cols[2] ? new Date(cols[2]).toISOString() : new Date().toISOString();
    const distanceKm = parseFloat(cols[3]?.replace(',', '.')) || 0;
    const consumptionVal = parseFloat(cols[4]?.replace(',', '.')) || 0;
    const category = (cols[5] as TripCategory) || 'Lavoro';

    if (distanceKm <= 0) continue;

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      user_id: currentUserId,
      departure_time: rawDate,
      arrival_time: rawDate,
      departure_address: departure,
      arrival_address: destination,
      distance_km: distanceKm,
      fuel_efficiency_kpl: consumptionVal > 0 ? consumptionVal : undefined,
      consumption_unit: 'l/100km', 
      category: category,
      notes: `Da ${departure} a ${destination}`,
    };

    parsedTrips.push(newTrip);
  }

  return parsedTrips;
}