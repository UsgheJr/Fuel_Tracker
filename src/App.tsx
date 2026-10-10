import { useState, useMemo } from 'react';
import type { Trip, RefuelBox } from './shared/types';
import { TripCsvUploader } from './features/trips/components/TripCsvUploader';
import { TripTable } from './features/trips/components/TripTable';
import { RefuelBoxList } from './features/refuels/components/RefuelBoxList';
import { TripFilters } from './features/trips/components/TripFilters';
import { enrichTripsWithCosts } from './features/trips/services/tripMatchingService';

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
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Aggiunta di un nuovo box rifornimento
  const handleAddRefuelBox = (newBox: RefuelBox) => {
    setRefuelBoxes((prev) => [...prev, newBox]);
  };

  // Arricchisce i viaggi con i costi calcolati in base ai box rifornimento
  const enrichedTrips = useMemo(() => {
    return enrichTripsWithCosts(trips, refuelBoxes);
  }, [trips, refuelBoxes]);

  // Estrae le categorie uniche per i filtri
  const categories = useMemo(() => {
    const set = new Set(trips.map((t) => t.category));
    return Array.from(set);
  }, [trips]);

  // Filtra i viaggi in base alla categoria selezionata
  const filteredTrips = useMemo(() => {
    if (selectedCategory === 'ALL') return enrichedTrips;
    return enrichedTrips.filter((t) => t.category === selectedCategory);
  }, [enrichedTrips, selectedCategory]);

  // Calcola i totali sui viaggi filtrati
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trip Cost Tracker</h1>
            <p className="text-sm text-gray-500">Gestione e monitoraggio intelligente dei costi di viaggio e rifornimenti</p>
          </div>
        </header>

        {/* Griglia superiore: Import CSV & Gestione Rifornimenti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Importa Viaggi</h2>
              <p className="text-xs text-gray-500 mb-4">Carica il file CSV esportato per popolare i tragitti.</p>
            </div>
            <TripCsvUploader onImportParsed={(parsedTrips) => setTrips(parsedTrips)} />
          </section>

          <section>
            <RefuelBoxList refuelBoxes={refuelBoxes} onAddRefuelBox={handleAddRefuelBox} />
          </section>
        </div>

        {/* Sezione Filtri e KPI */}
        {trips.length > 0 && (
          <section>
            <TripFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              totalCost={totalCost}
              totalKm={totalKm}
              totalTrips={filteredTrips.length}
            />
          </section>
        )}

        {/* Tabella Risultati */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Elenco Viaggi ({filteredTrips.length})</h2>
          <TripTable trips={filteredTrips} />
        </section>

      </div>
    </div>
  );
}