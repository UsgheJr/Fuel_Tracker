import { supabase } from '../../../shared/utils/supabaseClient';
import type { Trip } from '../../../shared/types';

export async function saveTripsToSupabase(trips: Trip[]) {
  // Prepariamo i dati per la tabella 'trips' su Supabase
  const formattedTrips = trips.map(t => ({
    departure_address: t.departure_address,
    departure_time: t.departure_time,
    arrival_address: t.arrival_address,
    arrival_time: t.arrival_time,
    distance_km: t.distance_km,
    average_consumption_l_100km: t.average_consumption_l_100km,
    category: t.category,
    calculated_cost: t.calculated_cost
  }));

  const { data, error } = await supabase
    .from('trips')
    .insert(formattedTrips)
    .select();

  if (error) {
    console.error('Errore nel salvataggio dei viaggi:', error);
    throw error;
  }

  return data;
}

export async function fetchTripsFromSupabase(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('departure_time', { ascending: false });

  if (error) {
    console.error('Errore nel recupero dei viaggi:', error);
    return [];
  }

  return data as Trip[];
}