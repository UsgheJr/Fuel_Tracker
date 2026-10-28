import { useAppController } from './features/app/hooks/useAppController';
import { appStyles as styles } from './features/app/styles/appStyles';
import { TripCsvUploader } from './features/trips/components/TripCsvUploader';
import { TripTable } from './features/trips/components/TripTable';
import { RefuelBoxList } from './features/refuels/components/RefuelBoxList';
import { TripFilters } from './features/trips/components/TripFilters';
import { TripManualForm } from './features/trips/components/TripManualForm';
import { SyncStatusIndicator } from './features/sync/components/SyncStatusIndicator';
import Login from './features/auth/components/Login';
import { isSupabaseConfigured } from './database/supabaseClient';
import { ConfigErrorFallback } from './shared/components/ConfigErrorFallback';


export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigErrorFallback />;
  }

  const {
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
  } = useAppController();

  if (loadingSession) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-100 text-xs font-medium text-slate-500">
        Verifica sessione in corso...
      </div>
    );
  }

  if (!session || !user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const userId = user.id;

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div>
            <h1 className={styles.title}>🚗 Trip Cost Tracker</h1>
            <p className={styles.subtitle}>
              Monitoraggio intelligente dei costi e dei rifornimenti di viaggio
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Indicatore Stato Sincronizzazione Offline */}
            <SyncStatusIndicator
              status={syncStatus}
              hasPending={hasPendingChanges}
              onManualSync={triggerManualSync}
            />
            <button
              onClick={() => setIsManualModalOpen(true)}
              className={styles.buttonPrimary}
            >
              + Inserisci Viaggio Manuale
            </button>
            <button
              onClick={() => signOut()}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 mb-1">
                Importa Viaggi
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Carica file CSV senza perdere i dati esistenti.
              </p>
            </div>
            <TripCsvUploader
              currentUserId={userId}
              onImportParsed={handleImportParsed}
            />
          </div>
          <div>
            <RefuelBoxList
              refuelBoxes={refuelBoxes}
              currentUserId={userId}
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
            <h2 className="text-base font-bold text-slate-800">
              Elenco Viaggi ({filteredTrips.length})
            </h2>
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
            currentUserId={userId}
          />
        </div>
      )}
    </div>
  );
}