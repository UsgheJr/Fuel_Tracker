// src/App.tsx

import { useAppController } from './features/app/hooks/useAppController';
import { appStyles as styles } from './features/app/styles/appStyles';
import { TripCsvUploader } from './features/trips/components/TripCsvUploader';
import { TripTable } from './features/trips/components/TripTable';
import { RefuelBoxList } from './features/refuels/components/RefuelBoxList';
import { TripFilters } from './features/trips/components/TripFilters';
import { TripManualForm } from './features/trips/components/TripManualForm';
import { supabase } from './database/supabaseClient';
import Login from './features/auth/components/Login';

export default function App() {
  const {
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
    handleDeleteMultiple,
    handleSaveToDatabase,
  } = useAppController();

  if (loadingSession) {
    return <div className="flex justify-center items-center h-screen bg-slate-100 text-xs font-medium text-slate-500">Verifica sessione in corso...</div>;
  }

  if (!session) {
    return <Login onLoginSuccess={(user) => setSession({ user })} />;
  }

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <h1 className={styles.title}>🚗 Trip Cost Tracker</h1>
            <p className={styles.subtitle}>Monitoraggio intelligente dei costi e dei rifornimenti di viaggio</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className={styles.buttonPrimary}
            >
              + Inserisci Viaggio Manuale
            </button>
            {trips.length > 0 && (
              <button
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className={styles.buttonSuccess}
              >
                {isSaving ? 'Salvataggio...' : 'Salva in Cloud'}
              </button>
            )}
            <button
              onClick={() => supabase.auth.signOut()}
              className={styles.buttonSecondary}
              title="Esci dall'account"
            >
              Esci
            </button>
          </div>
        </div>
      </header>

      <main className={styles.mainContainer}>
        {isLoadingDb && (
          <div className={styles.loadingSync}>
            Sincronizzazione dati con Supabase in corso...
          </div>
        )}

        {saveMessage && (
          <div className={`p-4 rounded-xl text-sm font-medium ${saveMessage.includes('successo') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">Importa Viaggi</h2>
              <p className="text-xs text-slate-400 mb-4">Carica file CSV senza perdere i dati esistenti.</p>
            </div>
            <TripCsvUploader 
                currentUserId={session?.user?.id ?? 'local-user-id'}
                onImportParsed={handleImportParsed} 
              />          
          </div>

          <div>
          <RefuelBoxList
            refuelBoxes={refuelBoxes}
            currentUserId={session?.user?.id ?? 'local-user-id'}
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
              onDeleteMultiple={handleDeleteMultiple}
            />
        </section>
      </main>

      {isManualModalOpen && (
        <div className={styles.modalOverlay}>
          <TripManualForm
            refuelBoxes={refuelBoxes}
            categories={categories}
            onAddTrip={handleAddManualTrip}
            onClose={() => setIsManualModalOpen(false)}
            currentUserId={session?.user?.id ?? 'local-user-id'}
          />
        </div>
      )}
    </div>
  );
}