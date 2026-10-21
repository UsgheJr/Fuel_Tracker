import { useState, useMemo, useCallback } from 'react';
import type { Trip } from '../../../shared/types';

export type TableDensity = 'compact' | 'expanded';

interface UseTripTableProps {
  trips: Trip[];
  onDeleteMultiple?: (tripIds: string[]) => void;
}

export function useTripTable({ trips, onDeleteMultiple }: UseTripTableProps) {
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [density, setDensity] = useState<TableDensity>('compact');

  const allTripIds = useMemo(() => trips.map((t) => t.id), [trips]);

  const isAllSelected = useMemo(() => {
    return allTripIds.length > 0 && allTripIds.every((id) => selectedTripIds.includes(id));
  }, [allTripIds, selectedTripIds]);

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedTripIds([]);
    } else {
      setSelectedTripIds(allTripIds);
    }
  }, [isAllSelected, allTripIds]);

  const handleSelectTrip = useCallback((tripId: string) => {
    setSelectedTripIds((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedTripIds.length === 0 || !onDeleteMultiple) return;
    onDeleteMultiple(selectedTripIds);
    setSelectedTripIds([]);
  }, [selectedTripIds, onDeleteMultiple]);

  return {
    density,
    setDensity,
    selectedTripIds,
    isAllSelected,
    handleSelectAll,
    handleSelectTrip,
    handleDeleteSelected,
  };
}