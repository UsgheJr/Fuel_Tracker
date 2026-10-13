import { supabase } from '../../../shared/utils/supabaseClient';
import type { Trip, RefuelBox } from '../../../shared/types';

export async function fetchTripsFromSupabase(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('departure_time', { ascending: false });

  if (error) {
    console.error('Errore nel recupero dei viaggi da Supabase:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    departure_address: t.departure_address,
    departure_time: t.departure_time,
    arrival_address: t.arrival_address,
    arrival_time: t.arrival_time,
    distance_km: t.distance_km,
    average_consumption_l_100km: t.average_consumption_l_100km,
    category: t.category,
    calculated_cost: t.calculated_cost,
    refuel_box_id: t.refuel_box_id,
  }));
}

export async function fetchRefuelsFromSupabase(): Promise<RefuelBox[]> {
  const { data, error } = await supabase
    .from('refuel_boxes')
    .select('*')
    .order('refuel_date', { ascending: true });

  if (error) {
    console.error('Errore nel recupero dei box rifornimento:', error);
    return [];
  }

  return (data || []).map((b: any) => ({
    id: b.id,
    refuel_date: b.refuel_date,
    fuel_price_per_liter: b.fuel_price_per_liter,
    notes: b.notes,
  }));
}

export async function saveTripsToSupabase(trips: Trip[]) {
  const formattedTrips = trips.map(t => ({
    departure_address: t.departure_address,
    departure_time: t.departure_time,
    arrival_address: t.arrival_address,
    arrival_time: t.arrival_time,
    distance_km: t.distance_km,
    average_consumption_l_100km: t.average_consumption_l_100km,
    category: t.category,
    calculated_cost: t.calculated_cost,
    refuel_box_id: t.refuel_box_id || null,
  }));

  const { data, error } = await supabase
    .from('trips')
    .upsert(formattedTrips, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Errore nel salvataggio dei viaggi su Supabase:', error);
    throw error;
  }

  return data;
}

export async function saveRefuelBoxToSupabase(box: RefuelBox) {
  const { data, error } = await supabase
    .from('refuel_boxes')
    .upsert({
      id: box.id,
      refuel_date: box.refuel_date,
      fuel_price_per_liter: box.fuel_price_per_liter,
      notes: box.notes,
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Errore nel salvataggio del box rifornimento:', error);
    throw error;
  }

  return data;
}