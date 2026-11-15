import { useState, useCallback, useEffect, useRef } from 'react';
import { LocalStorageService } from '../../../shared/services/storage/localStorageService';
import { SyncService, type ValidTableName } from '../services/syncService';
import { SYNC_CONFIG } from '../constants/syncConfig';
import { useBrowserLifecycleSync } from './useBrowserLifecycleSync';
import type { PendingItem, SyncStatus } from '../../../shared/types/sync';

export const useDataSync = <T extends { id: string }>(
  tableName: ValidTableName,
  cacheKey: string,
  autoSyncEnabled: boolean = true
) => {
  const [data, setData] = useState<T[]>(() => {
    return LocalStorageService.get<T[]>(cacheKey) || [];
  });

  const [pendingQueue, setPendingQueue] = useState<PendingItem<T>[]>(() => {
    return LocalStorageService.get<PendingItem<T>[]>(`${cacheKey}_queue`) || [];
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const isSyncingRef = useRef(false);

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

  const executeSync = useCallback(async () => {
    if (pendingQueue.length === 0 || isSyncingRef.current || !navigator.onLine) {
      return;
    }

    isSyncingRef.current = true;
    setSyncStatus('syncing');

    const snapshotToSync = [...pendingQueue];
    const { success } = await SyncService.syncPendingItems(tableName, snapshotToSync);

    if (success) {
      setSyncStatus('success');
      // Rimuove solo gli elementi effettivamente sincronizzati, preservando eventuali nuove aggiunte
      const syncedIds = new Set(snapshotToSync.map((item) => item.id));
      setPendingQueue((prev) => prev.filter((item) => !syncedIds.has(item.id)));
      LocalStorageService.set(SYNC_CONFIG.LAST_SYNC_STORAGE_KEY, Date.now());
    } else {
      setSyncStatus('error');
    }

    isSyncingRef.current = false;
  }, [pendingQueue, tableName]);

  // Trigger 1: Smart Batching (immediato sopra soglia CSV, altrimenti debounce 5s)
  useEffect(() => {
    if (!autoSyncEnabled || pendingQueue.length === 0) return;

    if (pendingQueue.length >= SYNC_CONFIG.BATCH_SIZE_THRESHOLD) {
      void executeSync();
      return;
    }

    const timer = setTimeout(() => {
      void executeSync();
    }, SYNC_CONFIG.DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [autoSyncEnabled, pendingQueue, executeSync]);

  // Trigger 2: Chiusura tab / Cambio app / Ritorno connessione
  useBrowserLifecycleSync({
    hasPending: autoSyncEnabled && pendingQueue.length > 0,
    onFlushRequired: executeSync,
  });

  const addItem = useCallback(
    (newItem: T) => {
      updateLocalData([newItem, ...data]);
      setPendingQueue((prev) => [
        ...prev,
        { id: newItem.id, payload: newItem, action: 'INSERT', timestamp: Date.now() },
      ]);
    },
    [data, updateLocalData]
  );

  const addBatchItems = useCallback(
    (newItems: T[]) => {
      updateLocalData([...newItems, ...data]);
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

  const removeItems = useCallback(
    (idsToRemove: string[]) => {
      updateLocalData(data.filter((item) => !idsToRemove.includes(item.id)));
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

  const updateItem = useCallback(
    (updatedItem: T) => {
      updateLocalData(
        data.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      );
      setPendingQueue((prev) => {
        // Se l'item è già in coda come INSERT/UPDATE, aggiorna direttamente il suo payload
        const existingIndex = prev.findIndex(
          (q) => q.id === updatedItem.id && q.action !== 'DELETE'
        );
        if (existingIndex > -1) {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            payload: updatedItem,
            timestamp: Date.now(),
          };
          return next;
        }
        return [
          ...prev,
          { id: updatedItem.id, payload: updatedItem, action: 'UPDATE', timestamp: Date.now() },
        ];
      });
    },
    [data, updateLocalData]
  );

  return {
    data,
    updateItem,
    setData: updateLocalData,
    addItem,
    addBatchItems,
    removeItems,
    syncStatus,
    triggerManualSync: executeSync,
    hasPendingChanges: pendingQueue.length > 0,
  };
};