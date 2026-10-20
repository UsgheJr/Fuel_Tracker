import { useState, useMemo } from 'react';
import type { EnrichedTrip } from '../components/TripTable';

export type SortField = 'departure_time' | 'departure_address' | 'arrival_address' | 'distance_km' | 'fuel_efficiency_kpl' | 'category' | 'calculated_cost';
export type SortOrder = 'asc' | 'desc' | 'none';

interface UseTripTableProps {
  trips: EnrichedTrip[];
  onDeleteMultiple: (tripIds: string[]) => void;
}

export function useTripTable({ trips, onDeleteMultiple }: UseTripTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('departure_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'desc') setSortOrder('asc');
      else if (sortOrder === 'asc') setSortOrder('none');
      else setSortOrder('desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTrips = useMemo(() => {
    if (sortOrder === 'none') return trips;

    return [...trips].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? comp : -comp;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [trips, sortField, sortOrder]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedTrips.map(t => t.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (tripId?: string) => {
    if (!tripId) return;
    setSelectedIds(prev =>
      prev.includes(tripId) ? prev.filter(id => id !== tripId) : [...prev, tripId]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    selectedIds,
    sortField,
    sortOrder,
    sortedTrips,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
  };
}