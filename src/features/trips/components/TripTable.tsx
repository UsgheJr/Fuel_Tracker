// src/features/trips/components/TripTable.tsx

import React from 'react';
import { useTripTable } from '../hooks/useTripTable';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

interface TripTableProps {
  userId: string;
}

export const TripTable: React.FC<TripTableProps> = ({ userId }) => {
  const { trips, loading, error, searchTerm, setSearchTerm } = useTripTable({ userId });

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Filtra per categoria o note..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.container}>
        {loading ? (
          <div className={styles.loading}>Caricamento viaggi in corso...</div>
        ) : (
          <table className={styles.table}>
            <thead className={styles.header}>
              <tr>
                <th className={styles.th}>Data/Ora</th>
                <th className={styles.th}>Distanza (km)</th>
                <th className={styles.th}>Categoria</th>
                <th className={styles.th}>Costo Calcolato</th>
                <th className={styles.th}>Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {trips.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.td + ' text-center text-gray-400'}>
                    Nessun viaggio trovato.
                  </td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip.id} className={styles.row}>
                    <td className={styles.td}>{formatDate(trip.departure_time)}</td>
                    <td className={styles.td}>{trip.distance_km} km</td>
                    <td className={styles.td}>
                      <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {trip.category}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {trip.cost !== undefined ? formatCurrency(trip.cost) : '-'}
                    </td>
                    <td className={styles.td}>{trip.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};