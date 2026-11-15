import { supabase } from '../supabaseClient';
import type { RefuelBox } from '../../shared/types';
import type { Tables, TablesInsert } from '../types/database.type';

export function mapDbRowToRefuelBox(row: Tables<'refuel_boxes'>): RefuelBox {
  return {
    id: row.id,
    user_id: row.user_id,
    refuel_date: row.refuel_date,
    price_per_liter: Number(row.fuel_price_per_liter),
    liters: Number(row.liters_added),
    spent_amount: Number(row.spent_amount ?? row.total_cost ?? 0),
    notes: row.notes ?? undefined,
    created_at: row.created_at,
  };
}

export function mapRefuelBoxToDbInsert(box: RefuelBox): TablesInsert<'refuel_boxes'> {
  return {
    id: box.id,
    user_id: box.user_id,
    refuel_date: box.refuel_date,
    fuel_price_per_liter: box.price_per_liter,
    liters_added: box.liters,
    spent_amount: box.spent_amount,
    total_cost: box.spent_amount,
    notes: box.notes ?? null,
    created_at: box.created_at,
  };
}

export async function fetchRefuels(userId: string): Promise<RefuelBox[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('refuel_boxes')
    .select('*')
    .eq('user_id', userId)
    .order('refuel_date', { ascending: false });

  if (error) {
    console.error('[RefuelRepository] Errore fetch:', error.message);
    throw new Error(`Impossibile recuperare i rifornimenti: ${error.message}`);
  }

  return (data || []).map(mapDbRowToRefuelBox);
}