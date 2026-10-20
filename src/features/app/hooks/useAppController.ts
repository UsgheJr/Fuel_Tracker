// src/features/app/hooks/useAppController.ts

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import { DEFAULT_CATEGORIES } from '../../../shared/types/categories';
import { enrichTripsWithCosts } from '../../trips/services/tripMatchingService';
import { supabase } from '../../../database/supabaseClient';
import { fetchTrips, upsertTrips } from '../../../database/repositories/tripRepositories';
import { fetchRefuels, upsertRefuelBox } from '../../../database/repositories/refuelRepositories';

export function useAppController() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [refuelBoxes, setRefuelBoxes] = useState<RefuelBox[]>([
    {
      id: 'default-box',
      refuel_date: '2026-10-01T00:00:00.000Z',
      liters: 50,
      price_per_liter: 1.859,
      spent_amount: 92.95,
      notes: 'Prezzo Standard Iniziale',
    },
  ]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBoxId, setSelectedBoxId] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(true);

  // Gestione Sessione Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Iniziale da Cloud
  useEffect(() => {
    if (!session) return;

    async function loadDataFromCloud() {
      setIsLoadingDb(true);
      try {
        const cloudTrips = await fetchTrips();
        const cloudBoxes = await fetchRefuels();

        if (cloudTrips.length > 0) setTrips(cloudTrips);
        if (cloudBoxes.length > 0) setRefuelBoxes(cloudBoxes);
      } catch (err) {
        console.error('Impossibile caricare i dati da Supabase:', err);
      } finally {
        setIsLoadingDb(false);
      }
    }

    loadDataFromCloud();
  }, [session]);

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
        // Fallback sicuro se le proprietà di indirizzo non sono presenti nell'interfaccia corrente
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
    setTrips((prev) => [...prev, ...parsedTrips]);
    setSaveMessage(null);
  }, []);

  const handleAddManualTrip = useCallback((newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setIsManualModalOpen(false);
    setSaveMessage(null);
  }, []);

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

  const handleDeleteTrip = useCallback((indexToDelete: number) => {
    setTrips((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  }, []);

  const handleDeleteMultiple = useCallback((indicesToDelete: number[]) => {
    setTrips((prev) => prev.filter((_, idx) => !indicesToDelete.includes(idx)));
  }, []);

  const handleUpdateCategory = useCallback((indexToUpdate: number, newCategory: string) => {
    setTrips((prev) =>
      prev.map((trip, idx) => (idx === indexToUpdate ? { ...trip, category: newCategory } : trip))
    );
  }, []);

  const handleUpdateRefuelBoxAssignment = useCallback((indexToUpdate: number, newBoxId: string) => {
    setTrips((prev) =>
      prev.map((trip, idx) => (idx === indexToUpdate ? { ...trip, refuel_box_id: newBoxId } : trip))
    );
  }, []);

  const handleSaveToDatabase = async () => {
    if (trips.length === 0) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await await upsertTrips(enrichedTrips);
      setSaveMessage('Viaggi salvati con successo su Supabase! 🎉');
    } catch (err) {
      setSaveMessage('Errore durante il salvataggio su Supabase. Verifica le policy RLS o la connessione.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    session,
    setSession,
    loadingSession,
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
    isSaving,
    saveMessage,
    isLoadingDb,
    uniqueCategories,
    filteredTrips,
    totalCost,
    totalKm,
    handleImportParsed,
    handleAddManualTrip,
    handleAddRefuelBox,
    handleUpdateRefuelBox,
    handleDeleteTrip,
    handleDeleteMultiple,
    handleUpdateCategory,
    handleUpdateRefuelBoxAssignment,
    handleSaveToDatabase,
  };
}