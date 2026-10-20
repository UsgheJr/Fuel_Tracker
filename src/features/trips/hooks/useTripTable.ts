// src/features/trips/hooks/useTripTable.ts

import { useState, useEffect, useCallback } from 'react';
import type { Trip } from '../../../shared/types';
import { fetchUserTrips } from '../services/tripService';

interface UseTripTableProps {
  userId: string;
}

export function useTripTable({ userId }: UseTripTableProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadTrips = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserTrips(userId);
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto durante il caricamento');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const filteredTrips = trips.filter((trip) =>
    trip.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trip.notes && trip.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    trips: filteredTrips,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    refreshTrips: loadTrips,
  };
}