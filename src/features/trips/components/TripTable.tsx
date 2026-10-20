// src/features/trips/components/TripTable.tsx

import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';
import type { Trip, RefuelBox } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';

interface TripTableProps {
  trips: Trip[];
  refuelBoxes?: RefuelBox[];
  categories?: TripCategory[];
  onDeleteTrip?: (index: number) => void;
  onDeleteMultiple?: (indices: number[]) => void;
  onUpdateCategory?: (index: number, category: string) => void;
  onUpdateRefuelBoxAssignment?: (index: number, boxId: string) => void;
}

export const TripTable: React.FC<TripTableProps> = ({ trips, onDeleteTrip }) => {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.header}>
          <tr>
            <th className={styles.th}>Data/Ora</th>
            <th className={styles.th}>Distanza (km)</th>
            <th className={styles.th}>Categoria</th>
            <th className={styles.th}>Costo</th>
            <th className={styles.th}>Note</th>
            {onDeleteTrip && <th className={styles.th}>Azioni</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {trips.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.td + ' text-center text-gray-400'}>
                Nessun viaggio trovato.
              </td>
            </tr>
          ) : (
            trips.map((trip, idx) => (
              <tr key={trip.id || idx} className={styles.row}>
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
                {onDeleteTrip && (
                  <td className={styles.td}>
                    <button
                      onClick={() => onDeleteTrip(idx)}
                      className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                    >
                      Elimina
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};