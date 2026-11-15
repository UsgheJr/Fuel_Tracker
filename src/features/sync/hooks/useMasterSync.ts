import { useCallback, useEffect } from 'react';
import { useDataSync } from './useDataSync';
import { SYNC_CONFIG } from '../constants/syncConfig';
import { useBrowserLifecycleSync } from './useBrowserLifecycleSync';
import type { Trip, RefuelBox } from '../../../shared/types';
import type { SyncStatus } from '../../../shared/types/sync';

export function useMasterSync(userId?: string) {
  const safeUserSuffix = userId || 'anonymous';

  // refuel_boxes (Padre): autoSync gestito dal master
  const refuelsSync = useDataSync<RefuelBox>(
    'refuel_boxes',
    `app_refuels_cache_${safeUserSuffix}`,
    false
  );

  // trips (Figlio): autoSync disabilitato per evitare violazioni FK
  const tripsSync = useDataSync<Trip>(
    'trips',
    `app_trips_cache_${safeUserSuffix}`,
    false
  );

  // Sincronizzazione sequenziale rigorosa: prima Padre, poi Figlio
  const triggerUnifiedSync = useCallback(async () => {
    if (!userId) return;
    await refuelsSync.triggerManualSync();
    await tripsSync.triggerManualSync();
  }, [userId, refuelsSync, tripsSync]);

  const unifiedHasPending = tripsSync.hasPendingChanges || refuelsSync.hasPendingChanges;

  // Smart Batching centralizzato e ordinato
  useEffect(() => {
    if (!unifiedHasPending || !userId) return;

    const timer = setTimeout(() => {
      void triggerUnifiedSync();
    }, SYNC_CONFIG.DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [unifiedHasPending, userId, triggerUnifiedSync]);

  // Flush atomico alla chiusura/background del browser
  useBrowserLifecycleSync({
    hasPending: unifiedHasPending && Boolean(userId),
    onFlushRequired: triggerUnifiedSync,
  });

  const unifiedSyncStatus: SyncStatus =
    tripsSync.syncStatus === 'error' || refuelsSync.syncStatus === 'error'
      ? 'error'
      : tripsSync.syncStatus === 'syncing' || refuelsSync.syncStatus === 'syncing'
      ? 'syncing'
      : 'idle';

  return {
    tripsSync,
    refuelsSync,
    triggerUnifiedSync,
    unifiedHasPending,
    unifiedSyncStatus,
  };
}