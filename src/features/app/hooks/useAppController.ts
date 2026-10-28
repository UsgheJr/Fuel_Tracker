import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import { DEFAULT_CATEGORIES } from '../../../shared/types/categories';
import { enrichTripsWithCosts } from '../../trips/services/tripMatchingService';
import { fetchTrips } from '../../../database/repositories/tripRepository';
import { fetchRefuels, upsertRefuelBox } from '../../../database/repositories/refuelRepository';
import { useAuth } from '../../auth/hooks/useAuth';
import { useDataSync } from '../../sync/hooks/useDataSync';

export function useAppController() {
  const { session, user, isLoading: loadingSession, signOut } = useAuth();
  
  // Integrazione dell'hook di Sincronizzazione Offline per i viaggi
  const {
    data: trips,
    setData: setTrips,
    addItem: addTripLocal,
    addBatchItems: addBatchTripsLocal,
    removeItems: removeTripsLocal,
    syncStatus,
    triggerManualSync,
    hasPendingChanges,
  } = useDataSync<Trip>('trips', 'app_trips_cache');

  const [refuelBoxes, setRefuelBoxes] = useState<RefuelBox[]>([]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBoxId, setSelectedBoxId] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  const userId = user?.id;

  // Caricamento e riconciliazione dei dati cloud -> locale al mount o cambio utente
  useEffect(() => {
    if (!userId) {
      setTrips([]);
      setRefuelBoxes([]);
      return;
    }

    async function loadDataFromCloud(currentUserId: string) {
      setIsLoadingDb(true);
      try {
        const [cloudTrips, cloudBoxes] = await Promise.all([
          fetchTrips(currentUserId),
          fetchRefuels(currentUserId),
        ]);
        
        // Se non ci sono modifiche pendenti non salvate, allinea la cache locale col DB
        if (!hasPendingChanges && cloudTrips.length > 0) {
          setTrips(cloudTrips);
        }
        setRefuelBoxes(cloudBoxes);
      } catch (err) {
        console.error('Modalità Offline attiva o errore di connessione Supabase:', err);
      } finally {
        setIsLoadingDb(false);
      }
    }

    loadDataFromCloud(userId);
  }, [userId, hasPendingChanges, setTrips]);

  const enrichedTrips = useMemo(() => {
    return enrichTripsWithCosts(trips, refuelBoxes);
  }, [trips, refuelBoxes]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(trips.map((t) => t.category));
    return Array.from(set);
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((trip) => {
      if (selectedCategory !== 'ALL' && trip.category !== selectedCategory) return false;
      if (selectedBoxId !== 'ALL') {
        const tripBoxId = trip.refuel_box_id || trip.matchedRefuelBox?.id;
        if (tripBoxId !== selectedBoxId) return false;
      }
      if (searchText.trim() !== '') {
        const query = searchText.toLowerCase();
        const notesMatch = trip.notes?.toLowerCase().includes(query) || false;
        if (!notesMatch) return false;
      }
      if (startDate) {
        const tripDate = new Date(trip.departure_time).getTime();
        const startTimestamp = new Date(`${startDate}T00:00:00`).getTime();
        if (tripDate < startTimestamp) return false;
      }
      if (endDate) {
        const tripDate = new Date(trip.departure_time).getTime();
        const endTimestamp = new Date(`${endDate}T23:59:59`).getTime();
        if (tripDate > endTimestamp) return false;
      }
      return true;
    });
  }, [enrichedTrips, selectedCategory, selectedBoxId, searchText, startDate, endDate]);

  const { totalCost, totalKm } = useMemo(() => {
    return filteredTrips.reduce(
      (acc, trip) => {
        acc.totalCost += trip.cost || 0;
        acc.totalKm += trip.distance_km || 0;
        return acc;
      },
      { totalCost: 0, totalKm: 0 }
    );
  }, [filteredTrips]);

  const handleImportParsed = useCallback((parsedTrips: Trip[]) => {
    addBatchTripsLocal(parsedTrips);
  }, [addBatchTripsLocal]);

  const handleAddManualTrip = useCallback((newTrip: Trip) => {
    addTripLocal(newTrip);
    setIsManualModalOpen(false);
  }, [addTripLocal]);

  const handleAddRefuelBox = useCallback(async (newBox: RefuelBox) => {
    setRefuelBoxes((prev) => [...prev, newBox]);
    try {
      await upsertRefuelBox(newBox);
    } catch (e) {
      console.error('Errore salvataggio box su cloud', e);
    }
  }, []);

  const handleUpdateRefuelBox = useCallback(async (updatedBox: RefuelBox) => {
    setRefuelBoxes((prev) =>
      prev.map((box) => (box.id === updatedBox.id ? updatedBox : box))
    );
    try {
      await upsertRefuelBox(updatedBox);
    } catch (e) {
      console.error('Errore aggiornamento box su cloud', e);
    }
  }, []);

  const handleDeleteMultiple = useCallback((tripIdsToDelete: string[]) => {
    removeTripsLocal(tripIdsToDelete);
  }, [removeTripsLocal]);

  return {
    session,
    user,
    loadingSession,
    signOut,
    trips,
    refuelBoxes,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedBoxId,
    setSelectedBoxId,
    searchText,
    setSearchText,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isManualModalOpen,
    setIsManualModalOpen,
    isLoadingDb,
    uniqueCategories,
    filteredTrips,
    totalCost,
    totalKm,
    syncStatus,
    hasPendingChanges,
    triggerManualSync,
    handleImportParsed,
    handleAddManualTrip,
    handleAddRefuelBox,
    handleUpdateRefuelBox,
    handleDeleteMultiple,
  };
}