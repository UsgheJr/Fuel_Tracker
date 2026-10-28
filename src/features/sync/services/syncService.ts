import { supabase } from '../../../database/supabaseClient';
import type { Database } from '../../../database/types/database.type';
import type { PendingItem } from '../../../shared/types/sync';

// Restrizione di tipo: limita le tabelle accettate a quelle reali definite in Database
export type ValidTableName = keyof Database['public']['Tables'];

export class SyncService {
  /**
   * Esegue la sincronizzazione batch separando le operazioni di scrittura (UPSERT)
   * da quelle di cancellazione (DELETE) per rispettare i vincoli di schema Supabase.
   */
  static async syncPendingItems<T extends { id: string }>(
    tableName: ValidTableName,
    pendingItems: PendingItem<T>[]
  ): Promise<{ success: boolean; error: Error | null }> {
    if (pendingItems.length === 0) return { success: true, error: null };

    try {
      // 1. Separazione delle azioni
      const deleteIds = pendingItems
        .filter((item) => item.action === 'DELETE')
        .map((item) => item.id);

      const upsertPayloads = pendingItems
        .filter((item) => item.action === 'INSERT' || item.action === 'UPDATE')
        .map((item) => item.payload);

      // 2. Esecuzione DELETE in batch
      if (deleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .in('id', deleteIds);

        if (deleteError) throw deleteError;
      }

      // 3. Esecuzione UPSERT in batch (con cast esplicito as any sul payload validato per Supabase client)
      if (upsertPayloads.length > 0) {
        const { error: upsertError } = await supabase
          .from(tableName)
          .upsert(upsertPayloads as any, { onConflict: 'id' });

        if (upsertError) throw upsertError;
      }

      return { success: true, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown sync error');
      console.error(`[SyncService] Errore sincronizzazione tabella ${tableName}:`, error);
      return { success: false, error };
    }
  }
}