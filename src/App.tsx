import { useState, useMemo } from 'react';
import type { Trip, RefuelBox } from './shared/types';
import { DEFAULT_CATEGORIES } from './shared/types/categories';
import { TripCsvUploader } from './features/trips/components/TripCsvUploader';
import { TripTable } from './features/trips/components/TripTable';
import { RefuelBoxList } from './features/refuels/components/RefuelBoxList';
import { TripFilters } from './features/trips/components/TripFilters';
import { TripManualForm } from './features/trips/components/TripManualForm';
import { enrichTripsWithCosts } from './features/trips/services/tripMatchingService';
import { saveTripsToSupabase } from './features/trips/services/tripService';

export default function App() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [refuelBoxes, setRefuelBoxes] = useState<RefuelBox[]>([
    {
      id: 'default-box',
      refuel_date: '2026-10-01T00:00:00.000Z',
      fuel_price_per_liter: 1.859,
      notes: 'Prezzo Standard Iniziale',
    },
  ]);
  const [categories] = useState(DEFAULT_CATEGORIES);
  
  // Stati per i Filtri Avanzati
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBoxId, setSelectedBoxId] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleImportParsed = (parsedTrips: Trip[]) => {
    setTrips((prevTrips) => [...prevTrips, ...parsedTrips]);
    setSaveMessage(null);
  };

  const handleAddManualTrip = (newTrip: Trip) => {
    setTrips((prev) => [newTrip, ...prev]);
    setIsManualModalOpen(false);
    setSaveMessage(null);
  };

  const handleAddRefuelBox = (newBox: RefuelBox) => {
    setRefuelBoxes((prev) => [...prev, newBox]);
  };

  const handleUpdateRefuelBox = (updatedBox: RefuelBox) => {
    setRefuelBoxes((prev) =>
      prev.map((box) => (box.id === updatedBox.id ? updatedBox : box))
    );
  };

  const handleDeleteTrip = (indexToDelete: number) => {
    setTrips((prev) => prev.filter((_, idx) => idx !== indexToDelete));
  };

  const handleDeleteMultiple = (indicesToDelete: number[]) => {
    setTrips((prev) => prev.filter((_, idx) => !indicesToDelete.includes(idx)));
  };

  const handleUpdateCategory = (indexToUpdate: number, newCategory: string) => {
    setTrips((prev) =>
      prev.map((trip, idx) => (idx === indexToUpdate ? { ...trip, category: newCategory } : trip))
    );
  };

  // Funzione per aggiornare il box assegnato direttamente da una riga della tabella
  const handleUpdateRefuelBoxAssignment = (indexToUpdate: number, newBoxId: string) => {
    setTrips((prev) =>
      prev.map((trip, idx) => (idx === indexToUpdate ? { ...trip, refuel_box_id: newBoxId } : trip))
    );
  };

  const enrichedTrips = useMemo(() => {
    return enrichTripsWithCosts(trips, refuelBoxes);
  }, [trips, refuelBoxes]);

  const uniqueCategories = useMemo(() => {
    const set = new Set(trips.map((t) => t.category));
    return Array.from(set);
  }, [trips]);

  // Logica di Filtraggio Multipla Avanzata
  const filteredTrips = useMemo(() => {
    return enrichedTrips.filter((trip) => {
      // 1. Filtro Categoria
      if (selectedCategory !== 'ALL' && trip.category !== selectedCategory) {
        return false;
      }
      // 2. Filtro Box Rifornimento
      if (selectedBoxId !== 'ALL') {
        const tripBoxId = trip.refuel_box_id || trip.matchedRefuelBox?.id;
        if (tripBoxId !== selectedBoxId) return false;
      }
      // 3. Filtro Testo (Partenza o Destinazione)
      if (searchText.trim() !== '') {
        const query = searchText.toLowerCase();
        const matchDep = trip.departure_address.toLowerCase().includes(query);
        const matchArr = trip.arrival_address.toLowerCase().includes(query);
        if (!matchDep && !matchArr) return false;
      }
      // 4. Filtro Data Inizio
      if (startDate) {
        const tripDate = new Date(trip.departure_time).getTime();
        const startTimestamp = new Date(`${startDate}T00:00:00`).getTime();
        if (tripDate < startTimestamp) return false;
      }
      // 5. Filtro Data Fine
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
        acc.totalCost += trip.calculated_cost || 0;
        acc.totalKm += trip.distance_km || 0;
        return acc;
      },
      { totalCost: 0, totalKm: 0 }
    );
  }, [filteredTrips]);

  const handleSaveToDatabase = async () => {
    if (trips.length === 0) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await saveTripsToSupabase(enrichedTrips);
      setSaveMessage('Viaggi salvati con successo su Supabase! 🎉');
    } catch (err) {
      setSaveMessage('Errore durante il salvataggio su Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12 relative">
      <header className="bg-white border-b border-slate-200 py-4 px-8 shadow-xs mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">🚗 Trip Cost Tracker</h1>
            <p className="text-xs text-slate-500">Monitoraggio intelligente dei costi e dei rifornimenti di viaggio</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              + Inserisci Viaggio Manuale
            </button>
            {trips.length > 0 && (
              <button
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Salvataggio...' : 'Salva su Supabase'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 space-y-6">
        {saveMessage && (
          <div className={`p-4 rounded-xl text-sm font-medium ${saveMessage.includes('successo') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Importa Viaggi (Modalità Append)</h2>
              <p className="text-xs text-slate-400 mb-4">Carica più file CSV in sequenza senza perdere i dati esistenti.</p>
            </div>
            <TripCsvUploader onImportParsed={handleImportParsed} />
          </div>

          <div>
            <RefuelBoxList
              refuelBoxes={refuelBoxes}
              onAddRefuelBox={handleAddRefuelBox}
              onUpdateRefuelBox={handleUpdateRefuelBox}
            />
          </div>
        </div>

        {trips.length > 0 && (
          <section>
            <TripFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={uniqueCategories}
              selectedBoxId={selectedBoxId}
              onBoxChange={setSelectedBoxId}
              refuelBoxes={refuelBoxes}
              searchText={searchText}
              onSearchTextChange={setSearchText}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              totalCost={totalCost}
              totalKm={totalKm}
              totalTrips={filteredTrips.length}
            />
          </section>
        )}

        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-800">Elenco Viaggi ({filteredTrips.length})</h2>
          </div>
          <TripTable
            trips={filteredTrips}
            refuelBoxes={refuelBoxes}
            categories={categories}
            onDeleteTrip={handleDeleteTrip}
            onDeleteMultiple={handleDeleteMultiple}
            onUpdateCategory={handleUpdateCategory}
            onUpdateRefuelBoxAssignment={handleUpdateRefuelBoxAssignment}
          />
        </section>
      </main>

      {/* Modale Inserimento Manuale */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <TripManualForm
            refuelBoxes={refuelBoxes}
            categories={categories}
            onAddTrip={handleAddManualTrip}
            onClose={() => setIsManualModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
}