// src/database/repositories/tripRepository.ts

import { supabase } from '../supabaseClient';
import type { Trip } from '../../shared/types';

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('departure_time', { ascending: false });

    if (error) throw error;
    return (data as Trip[]) || [];
  } catch (err) {
    console.error('Errore nel repository durante il fetch dei viaggi:', err);
    throw new Error('Impossibile caricare i viaggi dal database.');
  }
}

export async function upsertTrips(trips: Trip[]): Promise<void> {
  try {
    const { error } = await supabase
      .from('trips')
      .upsert(trips);

    if (error) throw error;
  } catch (err) {
    console.error('Errore nel repository durante il salvataggio dei viaggi:', err);
    throw new Error('Impossibile salvare i viaggi nel database.');
  }
}