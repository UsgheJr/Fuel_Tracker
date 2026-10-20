import { supabase } from '../../../shared/utils/supabaseClient';
import type { Trip, RefuelBox } from '../../../shared/types';

/**
 * Recupera la lista dei viaggi ordinati per data di partenza (dal più recente)
 */
export async function fetchTripsFromSupabase(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('departure_time', { ascending: false });

  if (error) {
    console.error('Errore nel recupero dei viaggi da Supabase:', error);
    throw error;
  }

  return (data || []).map((t: any): Trip => ({
    id: t.id,
    departure_address: t.departure_address,
    departure_time: t.departure_time,
    arrival_address: t.arrival_address,
    arrival_time: t.arrival_time,
    distance_km: t.distance_km,
    fuel_efficiency_kpl: t.fuel_efficiency_kpl ?? t.average_consumption_l_100km, // Supporto retrocompatibile
    category: t.category,
    calculated_cost: t.calculated_cost,
    refuel_box_id: t.refuel_box_id,
  }));
}

/**
 * Recupera la lista dei box rifornimento ordinati cronologicamente
 */
export async function fetchRefuelsFromSupabase(): Promise<RefuelBox[]> {
  const { data, error } = await supabase
    .from('refuel_boxes')
    .select('*')
    .order('refuel_date', { ascending: true });

  if (error) {
    console.error('Errore nel recupero dei box rifornimento:', error);
    throw error;
  }

  return (data || []).map((b: any): RefuelBox => ({
    id: b.id,
    refuel_date: b.refuel_date,
    fuel_price_per_liter: b.fuel_price_per_liter,
    spent_amount: b.spent_amount ?? undefined,
    liters_added: b.liters_added ?? undefined,
    notes: b.notes,
  }));
}

/**
 * Salva o aggiorna un batch di viaggi su Supabase
 */
export async function saveTripsToSupabase(trips: Trip[]) {
  const formattedTrips = trips.map(t => ({
    ...(t.id ? { id: t.id } : {}), // Includiamo l'ID se presente per permettere l'upsert corretto
    departure_address: t.departure_address,
    departure_time: t.departure_time,
    arrival_address: t.arrival_address,
    arrival_time: t.arrival_time,
    distance_km: t.distance_km,
    fuel_efficiency_kpl: t.fuel_efficiency_kpl || null,
    category: t.category,
    calculated_cost: t.calculated_cost || null,
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

/**
 * Salva o aggiorna un singolo box rifornimento su Supabase
 */
export async function saveRefuelBoxToSupabase(box: RefuelBox) {
  const { data, error } = await supabase
    .from('refuel_boxes')
    .upsert({
      id: box.id,
      refuel_date: box.refuel_date,
      fuel_price_per_liter: box.fuel_price_per_liter,
      spent_amount: box.spent_amount ?? null,
      liters_added: box.liters_added ?? null,
      notes: box.notes || null,
    }, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Errore nel salvataggio del box rifornimento:', error);
    throw error;
  }

  return data;
}