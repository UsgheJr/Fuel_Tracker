import { useEffect } from 'react';
import { LocalStorageService } from '../../../shared/services/storage/localStorageService';

const LAST_SYNC_KEY = 'app_last_sync_timestamp';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const useSyncTimer = (onSyncTrigger: () => Promise<void>) => {
  useEffect(() => {
    const checkAndSync = async () => {
      const lastSync = LocalStorageService.get<number>(LAST_SYNC_KEY);
      const now = Date.now();

      if (!lastSync || now - lastSync >= TWENTY_FOUR_HOURS_MS) {
        await onSyncTrigger();
        LocalStorageService.set(LAST_SYNC_KEY, Date.now());
      }
    };

    // Controlla subito al mount
    checkAndSync();

    // Imposta il controllo periodico ogni ora per verificare le 24h
    const interval = setInterval(checkAndSync, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [onSyncTrigger]);
};