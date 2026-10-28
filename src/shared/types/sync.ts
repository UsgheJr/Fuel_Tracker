export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

export interface PendingItem<T> {
  id: string;
  payload: T;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  timestamp: number;
}