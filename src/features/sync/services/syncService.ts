import type { PendingItem } from '../../../shared/types/sync';
import { supabase } from '../../../database/supabaseClient';

export class SyncService {
  /**
   * Esegue l'upsert in batch di tutti gli elementi in sospeso
   */
  static async syncPendingItems<T extends { id: string }>(
    tableName: string,
    pendingItems: PendingItem<T>[]
  ): Promise<{ success: boolean; error: Error | null }> {
    if (pendingItems.length === 0) return { success: true, error: null };

    try {
      const recordsToUpsert = pendingItems.map((item) => item.payload);

      const { error } = await supabase
        .from(tableName)
        .upsert(recordsToUpsert, { onConflict: 'id' });

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown sync error');
      console.error(`Failed to sync table ${tableName}:`, error);
      return { success: false, error };
    }
  }
}