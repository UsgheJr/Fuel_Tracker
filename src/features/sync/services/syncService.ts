import { supabase } from '../../../database/supabaseClient';
import { sanitizeTripForDatabase } from '../../../database/repositories/tripRepository';
import { mapRefuelBoxToDbInsert } from '../../../database/repositories/refuelRepository';
import type { Database } from '../../../database/types/database.type';
import type { PendingItem } from '../../../shared/types/sync';
import type { Trip, RefuelBox } from '../../../shared/types';

export type ValidTableName = keyof Database['public']['Tables'];

function formatPayloadForTable(tableName: ValidTableName, item: unknown): Record<string, unknown> {
  if (tableName === 'trips') {
    return sanitizeTripForDatabase(item as Trip) as Record<string, unknown>;
  }
  if (tableName === 'refuel_boxes') {
    return mapRefuelBoxToDbInsert(item as RefuelBox) as Record<string, unknown>;
  }
  return item as Record<string, unknown>;
}

export class SyncService {
  static async syncPendingItems<T extends { id: string }>(
    tableName: ValidTableName,
    pendingItems: PendingItem<T>[]
  ): Promise<{ success: boolean; error: Error | null }> {
    if (pendingItems.length === 0) return { success: true, error: null };

    try {
      const deleteIds = pendingItems
        .filter((item) => item.action === 'DELETE')
        .map((item) => item.id);

      const upsertPayloads = pendingItems
        .filter((item) => item.action === 'INSERT' || item.action === 'UPDATE')
        .map((item) => formatPayloadForTable(tableName, item.payload));

      if (deleteIds.length > 0) {
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .in('id', deleteIds);
        if (deleteError) throw deleteError;
      }

      if (upsertPayloads.length > 0) {
        const { error: upsertError } = await supabase
          .from(tableName)
          .upsert(upsertPayloads as never, { onConflict: 'id' });

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