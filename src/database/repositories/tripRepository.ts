import { supabase } from '../supabaseClient';
import type { Trip } from '../../shared/types';
import type { EnrichedTrip } from '../../features/trips/services/tripMatchingService';
import type { TablesInsert } from '../types/database.type';

/**
 * Mappatore puro (SRP): Rimuove tutte le proprietà di runtime e calcolate (es. cost, calculated_cost)
 * per garantire perfetta compatibilità con il tipo TablesInsert<'trips'> di Supabase.
 */
function sanitizeTripForDatabase(trip: Trip | EnrichedTrip): TablesInsert<'trips'> {
  return {
    id: trip.id,
    user_id: trip.user_id,
    departure_time: trip.departure_time,
    arrival_time: trip.arrival_time ?? null,
    departure_address: trip.departure_address ?? null,
    arrival_address: trip.arrival_address ?? null,
    distance_km: trip.distance_km,
    fuel_efficiency_kpl: trip.fuel_efficiency_kpl ?? null,
    consumption_unit: trip.consumption_unit ?? null,
    refuel_box_id: trip.refuel_box_id ?? null,
    category: trip.category,
    notes: trip.notes ?? null,
    created_at: trip.created_at,
  };
}

export async function fetchTrips(userId: string): Promise<Trip[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('departure_time', { ascending: false });

    if (error) {
      console.error('[TripRepository] Errore nel recupero dei viaggi:', error.message);
      throw new Error(`Impossibile caricare i viaggi: ${error.message}`);
    }

    return (data as Trip[]) || [];
  } catch (err) {
    console.error('[TripRepository] Eccezione fetchTrips:', err);
    throw err;
  }
}

export async function upsertTrips(trips: (Trip | EnrichedTrip)[]): Promise<void> {
  if (!trips || trips.length === 0) return;

  try {
    const sanitizedPayload: TablesInsert<'trips'>[] = trips.map(sanitizeTripForDatabase);

    const { error } = await supabase
      .from('trips')
      .upsert(sanitizedPayload, { onConflict: 'id' });

    if (error) {
      console.error('[TripRepository] Errore nell\'upsert dei viaggi:', error.message);
      throw new Error(`Impossibile salvare i viaggi nel database: ${error.message}`);
    }
  } catch (err) {
    console.error('[TripRepository] Eccezione upsertTrips:', err);
    throw err;
  }
}