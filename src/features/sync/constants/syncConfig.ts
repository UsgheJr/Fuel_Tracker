export const SYNC_CONFIG = {
  /** Attesa in ms prima di inviare un singolo inserimento/modifica (accorpa azioni ravvicinate) */
  DEBOUNCE_DELAY_MS: 5000,
  /** Numero massimo di operazioni in coda prima di forzare un flush immediato (es. import CSV) */
  BATCH_SIZE_THRESHOLD: 10,
  /** Intervallo di sicurezza in ms per tentativi falliti (es. offline temporaneo) */
  RETRY_INTERVAL_MS: 5 * 60 * 1000, // 5 minuti
  LAST_SYNC_STORAGE_KEY: 'app_last_sync_timestamp',
} as const;