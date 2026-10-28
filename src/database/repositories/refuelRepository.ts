import { supabase } from '../supabaseClient';
import type { RefuelBox } from '../../shared/types';

export async function fetchRefuels(userId: string): Promise<RefuelBox[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('refuels')
      .select('*')
      .eq('user_id', userId)
      .order('refuel_date', { ascending: false });

    if (error) {
      console.error('[RefuelRepository] Errore durante la fetch:', error.message);
      throw new Error(`Impossibile recuperare i rifornimenti: ${error.message}`);
    }

    return (data as RefuelBox[]) || [];
  } catch (err) {
    console.error('[RefuelRepository] Eccezione fetchRefuels:', err);
    throw err;
  }
}

export async function upsertRefuelBox(box: RefuelBox): Promise<void> {
  if (!box || !box.id || !box.user_id) {
    throw new Error('[RefuelRepository] Dati rifornimento non validi per l\'upsert.');
  }

  try {
    const { error } = await supabase
      .from('refuels')
      .upsert([box], { onConflict: 'id' });

    if (error) {
      console.error('[RefuelRepository] Errore durante l\'upsert:', error.message);
      throw new Error(`Impossibile salvare il rifornimento: ${error.message}`);
    }
  } catch (err) {
    console.error('[RefuelRepository] Eccezione upsertRefuelBox:', err);
    throw err;
  }
}