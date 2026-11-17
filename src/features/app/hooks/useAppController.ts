import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import { DEFAULT_CATEGORIES } from '../../../shared/types/categories';
import { enrichTripsWithCosts } from '../../trips/services/tripMatchingService';
import { fetchTrips } from '../../../database/repositories/tripRepository';
import { fetchRefuels } from '../../../database/repositories/refuelRepository';
import { useAuth } from '../../auth/hooks/useAuth';
import { useMasterSync } from '../../sync/hooks/useMasterSync';
import { useReimbursements } from '../../reimbursements/hooks/useReimbursements';
import { tripMatchesRefuelBox } from '../../reimbursements/services/reimbursementCalculator';

export function useAppController() {
  const { session, user, isLoading: loadingSession, signOut } = useAuth();
  const userId = user?.id;

  const {
    tripsSync,
    refuelsSync,
    triggerUnifiedSync,
    unifiedHasPending,
    unifiedSyncStatus,
  } = useMasterSync(userId);

  const {
    data: trips,
    setData: setTrips,
    addItem: addTripLocal,
    addBatchItems: addBatchTripsLocal,
    updateBatchItems: updateTripsBatchLocal,
    removeItems: removeTripsLocal,
    hasPendingChanges: hasPendingTrips,
  } = tripsSync;

  const {
    data: refuelBoxes,
    setData: setRefuelBoxes,
    addItem: addRefuelBoxLocal,
    updateItem: updateRefuelBoxLocal,
    hasPendingChanges: hasPendingRefuels,
  } = refuelsSync;

  const [categories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBoxId, setSelectedBoxId] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  // Riconciliazione dati cloud -> locale all'avvio o al cambio utente
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

        if (!hasPendingTrips) {
          setTrips(cloudTrips);
        }
        if (!hasPendingRefuels) {
          setRefuelBoxes(cloudBoxes);
        }
      } catch (err) {
        console.error('[AppController] Errore caricamento dati da Supabase:', err);
      } finally {
        setIsLoadingDb(false);
      }
    }

    void loadDataFromCloud(userId);
  }, [userId, hasPendingTrips, hasPendingRefuels, setTrips, setRefuelBoxes]);

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
        if (!tripMatchesRefuelBox(trip, selectedBoxId)) return false;
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

  const hasActiveFilters = useMemo(() => {
    return (
      selectedCategory !== 'ALL' ||
      selectedBoxId !== 'ALL' ||
      searchText.trim() !== '' ||
      startDate !== '' ||
      endDate !== ''
    );
  }, [selectedCategory, selectedBoxId, searchText, startDate, endDate]);

  // Gestione Rimborsi Lavoro (4 livelli di granularità)
  const {
    summary: reimbursementSummary,
    filteredPendingSummary: filteredReimbursementSummary,
    reimburseSingleTrip,
    reimburseSelectedTrips,
    reimburseByRefuelBox,
    reimburseFilteredPeriod,
  } = useReimbursements({
    rawTrips: trips,
    enrichedTrips,
    filteredTrips,
    onUpdateTripsBatch: updateTripsBatchLocal,
  });

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

  const handleImportParsed = useCallback(
    (parsedTrips: Trip[]) => {
      addBatchTripsLocal(parsedTrips);
    },
    [addBatchTripsLocal]
  );

  const handleAddManualTrip = useCallback(
    (newTrip: Trip) => {
      addTripLocal(newTrip);
      setIsManualModalOpen(false);
    },
    [addTripLocal]
  );

  const handleAddRefuelBox = useCallback(
    (newBox: RefuelBox) => {
      addRefuelBoxLocal(newBox);
    },
    [addRefuelBoxLocal]
  );

  const handleUpdateRefuelBox = useCallback(
    (updatedBox: RefuelBox) => {
      updateRefuelBoxLocal(updatedBox);
    },
    [updateRefuelBoxLocal]
  );

  const handleDeleteMultiple = useCallback(
    (tripIdsToDelete: string[]) => {
      removeTripsLocal(tripIdsToDelete);
    },
    [removeTripsLocal]
  );

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
    hasActiveFilters,
    isManualModalOpen,
    setIsManualModalOpen,
    isLoadingDb,
    uniqueCategories,
    filteredTrips,
    totalCost,
    totalKm,
    syncStatus: unifiedSyncStatus,
    hasPendingChanges: unifiedHasPending,
    triggerManualSync: triggerUnifiedSync,
    reimbursementSummary,
    filteredReimbursementSummary,
    reimburseSingleTrip,
    reimburseSelectedTrips,
    reimburseByRefuelBox,
    reimburseFilteredPeriod,
    handleImportParsed,
    handleAddManualTrip,
    handleAddRefuelBox,
    handleUpdateRefuelBox,
    handleDeleteMultiple,
  };
}