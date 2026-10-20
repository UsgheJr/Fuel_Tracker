import React from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useTripTable } from '../hooks/useTripTable';
import type { SortField } from '../hooks/useTripTable';
import { tripTableStyles as styles } from '../styles/tripTableStyles';

export interface EnrichedTrip extends Trip {
  matchedRefuelBox?: RefuelBox;
  isBoxDateMismatched?: boolean;
  warningMessage?: string;
}

interface TripTableProps {
  trips: EnrichedTrip[];
  refuelBoxes: RefuelBox[];
  categories: TripCategory[];
  onDeleteTrip: (tripId: string) => void;
  onDeleteMultiple: (tripIds: string[]) => void;
  onUpdateCategory: (tripId: string, newCategory: string) => void;
  onUpdateRefuelBoxAssignment: (tripId: string, boxId: string) => void;
}

export const TripTable: React.FC<TripTableProps> = ({
  trips,
  refuelBoxes,
  categories,
  onDeleteTrip,
  onDeleteMultiple,
  onUpdateCategory,
  onUpdateRefuelBoxAssignment,
}) => {
  const {
    selectedIds,
    sortField,
    sortOrder,
    sortedTrips,
    handleSort,
    handleSelectAll,
    handleSelectRow,
    clearSelection,
  } = useTripTable({ trips, onDeleteMultiple });

  if (trips.length === 0) {
    return <div className={styles.emptyState}>Nessun viaggio trovato con i filtri selezionati.</div>;
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === 'none') return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-indigo-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className={styles.container}>
      {selectedIds.length > 0 && (
        <div className={styles.batchBar}>
          <span className={styles.batchText}>{selectedIds.length} viaggi selezionati</span>
          <button
            onClick={() => {
              onDeleteMultiple(selectedIds);
              clearSelection();
            }}
            className={styles.batchButton}
          >
            Elimina Selezionati
          </button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <div className={styles.scrollContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.thCheckbox}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === trips.length && trips.length > 0}
                    className={styles.checkbox}
                  />
                </th>
                <th className={styles.th} onClick={() => handleSort('departure_time')}>
                  Data & Ora {renderSortIcon('departure_time')}
                </th>
                <th className={styles.th} onClick={() => handleSort('departure_address')}>
                  Partenza {renderSortIcon('departure_address')}
                </th>
                <th className={styles.th} onClick={() => handleSort('arrival_address')}>
                  Destinazione {renderSortIcon('arrival_address')}
                </th>
                <th className={styles.th} onClick={() => handleSort('distance_km')}>
                  Distanza {renderSortIcon('distance_km')}
                </th>
                <th className={styles.th}>Box Rifornimento</th>
                <th className={styles.th} onClick={() => handleSort('category')}>
                  Categoria {renderSortIcon('category')}
                </th>
                <th className={styles.thRight} onClick={() => handleSort('calculated_cost')}>
                  Costo Viaggio {renderSortIcon('calculated_cost')}
                </th>
                <th className={styles.thCenter}>Azioni</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {sortedTrips.map((trip) => {
                const currentCat = categories.find(c => c.label === trip.category);
                const badgeColor = currentCat ? currentCat.color : 'bg-slate-100 text-slate-700 border-slate-200';
                const tripId = trip.id || '';

                return (
                  <tr key={tripId || Math.random()} className={styles.tr}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tripId)}
                        onChange={() => handleSelectRow(tripId)}
                        className={styles.checkbox}
                      />
                    </td>
                    <td className={styles.td}>{formatDate(trip.departure_time)}</td>
                    <td className={styles.tdText} title={trip.departure_address}>{trip.departure_address}</td>
                    <td className={styles.tdText} title={trip.arrival_address}>{trip.arrival_address}</td>
                    <td className={styles.td}>{trip.distance_km} km</td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={trip.refuel_box_id || trip.matchedRefuelBox?.id || ''}
                          onChange={(e) => onUpdateRefuelBoxAssignment(tripId, e.target.value)}
                          className={styles.selectBox}
                        >
                          {refuelBoxes.map((box) => (
                            <option key={box.id} value={box.id}>
                              ⛽ {box.notes} ({box.fuel_price_per_liter} €/l)
                            </option>
                          ))}
                        </select>
                        {trip.isBoxDateMismatched && (
                          <span title={trip.warningMessage} className={styles.warningBadge}>
                            ⚠️ Inconformità
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={trip.category}
                        onChange={(e) => onUpdateCategory(tripId, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${badgeColor}`}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.tdRight}>{formatCurrency(trip.calculated_cost || 0)}</td>
                    <td className={styles.tdCenter}>
                      <button
                        onClick={() => onDeleteTrip(tripId)}
                        title="Elimina viaggio"
                        className={styles.deleteButton}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};