import { useEffect } from 'react';

interface UseBrowserLifecycleSyncProps {
  hasPending: boolean;
  onFlushRequired: () => Promise<void>;
}

/**
 * Attiva la sincronizzazione quando l'utente lascia la pagina (tab switch / background)
 * o quando il dispositivo torna online, evitando polling inutili.
 */
export function useBrowserLifecycleSync({
  hasPending,
  onFlushRequired,
}: UseBrowserLifecycleSyncProps): void {
  useEffect(() => {
    if (!hasPending) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void onFlushRequired();
      }
    };

    const handleOnline = () => {
      void onFlushRequired();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [hasPending, onFlushRequired]);
}