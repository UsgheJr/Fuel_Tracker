import React from 'react';
import type { SyncStatus } from '../../../shared/types/sync';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  hasPending: boolean;
  onManualSync: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  status,
  hasPending,
  onManualSync,
}) => {
  return (
    <div className="flex items-center gap-3 p-2 text-sm bg-gray-50 border rounded-lg">
      <span className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            hasPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        {hasPending ? 'Modifiche non salvate in cloud' : 'Dati sincronizzati'}
      </span>

      <button
        onClick={onManualSync}
        disabled={status === 'syncing' || !hasPending}
        className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {status === 'syncing' ? 'Sincronizzazione...' : 'Sincronizza Ora'}
      </button>
    </div>
  );
};