import { supabase } from '../supabaseClient';
import type { RefuelBox } from '../../shared/types';

export async function fetchRefuels(userId: string): Promise<RefuelBox[]> {
  try {
    const { data, error } = await supabase
      .from('refuels')
      .select('*')
      .eq('user_id', userId)
      .order('refuel_date', { ascending: false });

    if (error) throw error;
    return (data as RefuelBox[]) || [];
  } catch (err) {
    console.error('Errore nel repository durante il fetch dei rifornimenti:', err);
    throw new Error('Impossibile caricare i rifornimenti dal database.');
  }
}

export async function upsertRefuelBox(box: RefuelBox): Promise<void> {
  try {
    const { error } = await supabase
      .from('refuels')
      .upsert([box], { onConflict: 'id' });

    if (error) throw error;
  } catch (err) {
    console.error('Errore nel repository durante il salvataggio del rifornimento:', err);
    throw new Error('Impossibile salvare il rifornimento nel database.');
  }
}