import { useState, useCallback, useEffect } from 'react';
import { LocalStorageService } from '../../../shared/services/storage/localStorageService';
import { SyncService, type ValidTableName } from '../services/syncService';
import type { PendingItem, SyncStatus } from '../../../shared/types/sync';
import { useSyncTimer } from './useSyncTimer';

export const useDataSync = <T extends { id: string }>(
  tableName: ValidTableName,
  cacheKey: string
) => {
  const [data, setData] = useState<T[]>(() => {
    return LocalStorageService.get<T[]>(cacheKey) || [];
  });

  const [pendingQueue, setPendingQueue] = useState<PendingItem<T>[]>(() => {
    return LocalStorageService.get<PendingItem<T>[]>(`${cacheKey}_queue`) || [];
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Persistenza della coda su localStorage ad ogni variazione
  useEffect(() => {
    LocalStorageService.set(`${cacheKey}_queue`, pendingQueue);
  }, [pendingQueue, cacheKey]);

  const updateLocalData = useCallback(
    (newData: T[]) => {
      setData(newData);
      LocalStorageService.set(cacheKey, newData);
    },
    [cacheKey]
  );

  // Esecuzione sincronizzazione verso Supabase
  const executeSync = useCallback(async () => {
    if (pendingQueue.length === 0) return;

    setSyncStatus('syncing');
    const { success } = await SyncService.syncPendingItems(tableName, pendingQueue);

    if (success) {
      setSyncStatus('success');
      setPendingQueue([]);
      LocalStorageService.remove(`${cacheKey}_queue`);
      LocalStorageService.set('app_last_sync_timestamp', Date.now());
    } else {
      setSyncStatus('error');
    }
  }, [pendingQueue, tableName, cacheKey]);

  useSyncTimer(executeSync);

  // Aggiunta elemento singolo locale
  const addItem = useCallback(
    (newItem: T) => {
      const updated = [newItem, ...data];
      updateLocalData(updated);

      setPendingQueue((prev) => [
        ...prev,
        { id: newItem.id, payload: newItem, action: 'INSERT', timestamp: Date.now() },
      ]);
    },
    [data, updateLocalData]
  );

  // Aggiunta batch di elementi locali (es. da CSV)
  const addBatchItems = useCallback(
    (newItems: T[]) => {
      const updated = [...newItems, ...data];
      updateLocalData(updated);

      const pendingBatch: PendingItem<T>[] = newItems.map((item) => ({
        id: item.id,
        payload: item,
        action: 'INSERT',
        timestamp: Date.now(),
      }));

      setPendingQueue((prev) => [...prev, ...pendingBatch]);
    },
    [data, updateLocalData]
  );

  // Rimozione elementi locali
  const removeItems = useCallback(
    (idsToRemove: string[]) => {
      const updated = data.filter((item) => !idsToRemove.includes(item.id));
      updateLocalData(updated);

      const deleteQueueItems: PendingItem<T>[] = idsToRemove.map((id) => ({
        id,
        payload: { id } as T,
        action: 'DELETE',
        timestamp: Date.now(),
      }));

      setPendingQueue((prev) => [...prev, ...deleteQueueItems]);
    },
    [data, updateLocalData]
  );

  return {
    data,
    setData: updateLocalData,
    addItem,
    addBatchItems,
    removeItems,
    syncStatus,
    triggerManualSync: executeSync,
    hasPendingChanges: pendingQueue.length > 0,
  };
};