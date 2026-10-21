import { supabase } from '../supabaseClient';
import type { Trip } from '../../shared/types';
import type { EnrichedTrip } from '../../features/trips/services/tripMatchingService';

export async function fetchTrips(userId: string): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('departure_time', { ascending: false });

    if (error) throw error;
    return (data as Trip[]) || [];
  } catch (err) {
    console.error('Errore nel repository durante il fetch dei viaggi:', err);
    throw new Error('Impossibile caricare i viaggi dal database.');
  }
}

export async function upsertTrips(trips: (Trip | EnrichedTrip)[]): Promise<void> {
  try {
    // Sanitizzazione dell'oggetto: rimozione delle proprietà calcolate a runtime per la UI
    const sanitizedTrips: Trip[] = trips.map((t) => {
      const { 
        calculated_cost, 
        matchedRefuelBox, 
        isBoxDateMismatched, 
        warningMessage, 
        ...pureTrip 
      } = t as EnrichedTrip;
      
      return pureTrip;
    });

    const { error } = await supabase
      .from('trips')
      .upsert(sanitizedTrips, { onConflict: 'id' });

    if (error) throw error;
  } catch (err) {
    console.error('Errore nel repository durante il salvataggio dei viaggi:', err);
    throw new Error('Impossibile salvare i viaggi nel database.');
  }
}