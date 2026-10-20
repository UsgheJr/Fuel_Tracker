// src/features/trips/services/tripService.ts

import { supabase } from '../../../database/supabaseClient';
import type { Trip, TripInput } from '../../../shared/types';

export async function fetchUserTrips(userId: string): Promise<Trip[]> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Trip[];
  } catch (err) {
    console.error('Errore durante il recupero dei viaggi:', err);
    throw new Error('Impossibile caricare la lista dei viaggi.');
  }
}

export async function createTrip(userId: string, tripData: TripInput): Promise<Trip> {
  try {
    const { data, error } = await supabase
      .from('trips')
      .insert([{ ...tripData, user_id: userId }])
      .select()
      .single();

    if (error) throw error;
    return data as Trip;
  } catch (err) {
    console.error('Errore durante la creazione del viaggio:', err);
    throw new Error('Impossibile salvare il nuovo viaggio.');
  }
}