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
    <div className="flex items-center gap-2 sm:gap-3 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg">
      <span className="flex items-center gap-1.5 font-medium text-slate-700">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            hasPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
          }`}
        />
        <span className="hidden md:inline">
          {hasPending ? 'Modifiche non salvate in cloud' : 'Dati sincronizzati'}
        </span>
        <span className="md:hidden">
          {hasPending ? 'Da salvare' : 'Sync OK'}
        </span>
      </span>
      <button
        type="button"
        onClick={onManualSync}
        disabled={status === 'syncing' || !hasPending}
        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer"
      >
        {status === 'syncing' ? 'Sync...' : 'Sincronizza'}
      </button>
    </div>
  );
};