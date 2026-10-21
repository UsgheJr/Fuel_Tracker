import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import { useTripTable } from '../hooks/useTripTable';
import { TripTableToolbar } from './TripTableToolbar';
import { TripTableRow } from './TripTableRow';
import type { EnrichedTrip } from '../services/tripMatchingService';

export interface TripTableProps {
  trips: EnrichedTrip[];
  onDeleteMultiple?: (tripIds: string[]) => void;
}

export const TripTable: React.FC<TripTableProps> = ({ trips, onDeleteMultiple }) => {
  const {
    density,
    setDensity,
    selectedTripIds,
    isAllSelected,
    handleSelectAll,
    handleSelectTrip,
    handleDeleteSelected,
  } = useTripTable({ trips, onDeleteMultiple });

  const isCompact = density === 'compact';
  const totalColumns = isCompact ? 6 : 9;

  return (
    <div className={styles.container}>
      <TripTableToolbar
        selectedCount={selectedTripIds.length}
        density={density}
        onDensityChange={setDensity}
        onDeleteSelected={handleDeleteSelected}
      />

      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead className={styles.header}>
            <tr>
              <th className={styles.th + ' w-10'}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className={styles.checkbox}
                />
              </th>
              <th className={styles.th}>Data / Ora</th>
              <th className={styles.th}>Distanza</th>
              <th className={styles.th}>Categoria</th>
              <th className={styles.th}>Consumo</th>
              <th className={styles.th}>Costo</th>
              {!isCompact && (
                <>
                  <th className={styles.th}>Partenza</th>
                  <th className={styles.th}>Arrivo</th>
                  <th className={styles.th}>Note / Avvisi</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {trips.length === 0 ? (
              <tr>
                <td colSpan={totalColumns} className="text-center py-8 text-slate-400 italic">
                  Nessun viaggio trovato con i filtri selezionati.
                </td>
              </tr>
            ) : (
              trips.map((trip) => (
                <TripTableRow
                  key={trip.id}
                  trip={trip}
                  density={density}
                  isSelected={selectedTripIds.includes(trip.id)}
                  onSelect={handleSelectTrip}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};