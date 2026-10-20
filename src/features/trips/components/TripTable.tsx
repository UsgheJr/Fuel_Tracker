import React, { useState, useMemo } from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

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

// Allineato a fuel_efficiency_kpl anziché average_consumption_l_100km
type SortField = 'departure_time' | 'departure_address' | 'arrival_address' | 'distance_km' | 'fuel_efficiency_kpl' | 'category' | 'calculated_cost';
type SortOrder = 'asc' | 'desc' | 'none';

export const TripTable: React.FC<TripTableProps> = ({
  trips,
  refuelBoxes,
  categories,
  onDeleteTrip,
  onDeleteMultiple,
  onUpdateCategory,
  onUpdateRefuelBoxAssignment,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('departure_time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === 'desc') setSortOrder('asc');
      else if (sortOrder === 'asc') setSortOrder('none');
      else setSortOrder('desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTrips = useMemo(() => {
    if (sortOrder === 'none') return trips;

    return [...trips].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string' && typeof valB === 'string') {
        const comp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? comp : -comp;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [trips, sortField, sortOrder]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(sortedTrips.map(t => t.id).filter(Boolean) as string[]);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (tripId?: string) => {
    if (!tripId) return;
    setSelectedIds(prev =>
      prev.includes(tripId) ? prev.filter(id => id !== tripId) : [...prev, tripId]
    );
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-400 text-sm">Nessun viaggio trovato con i filtri selezionati.</p>
      </div>
    );
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field || sortOrder === 'none') return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-indigo-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center px-4">
          <span className="text-xs font-semibold text-indigo-900">
            {selectedIds.length} viaggi selezionati
          </span>
          <button
            onClick={() => {
              onDeleteMultiple(selectedIds);
              setSelectedIds([]);
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            Elimina Selezionati
          </button>
        </div>
      )}

      <div className="overflow-hidden shadow-sm rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === trips.length && trips.length > 0}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3.5 cursor-pointer select-none" onClick={() => handleSort('departure_time')}>
                  Data & Ora {renderSortIcon('departure_time')}
                </th>
                <th className="px-4 py-3.5 cursor-pointer select-none" onClick={() => handleSort('departure_address')}>
                  Partenza {renderSortIcon('departure_address')}
                </th>
                <th className="px-4 py-3.5 cursor-pointer select-none" onClick={() => handleSort('arrival_address')}>
                  Destinazione {renderSortIcon('arrival_address')}
                </th>
                <th className="px-4 py-3.5 cursor-pointer select-none" onClick={() => handleSort('distance_km')}>
                  Distanza {renderSortIcon('distance_km')}
                </th>
                <th className="px-4 py-3.5">Box Rifornimento</th>
                <th className="px-4 py-3.5 cursor-pointer select-none" onClick={() => handleSort('category')}>
                  Categoria {renderSortIcon('category')}
                </th>
                <th className="px-4 py-3.5 text-right cursor-pointer select-none" onClick={() => handleSort('calculated_cost')}>
                  Costo Viaggio {renderSortIcon('calculated_cost')}
                </th>
                <th className="px-4 py-3.5 text-center">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedTrips.map((trip) => {
                const currentCat = categories.find(c => c.label === trip.category);
                const badgeColor = currentCat ? currentCat.color : 'bg-slate-100 text-slate-700 border-slate-200';
                const tripId = trip.id || '';

                return (
                  <tr key={tripId || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tripId)}
                        onChange={() => handleSelectRow(tripId)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap text-xs font-medium">
                      {formatDate(trip.departure_time)}
                    </td>
                    <td className="px-4 py-4 text-slate-900 max-w-xs truncate font-medium" title={trip.departure_address}>
                      {trip.departure_address}
                    </td>
                    <td className="px-4 py-4 text-slate-900 max-w-xs truncate font-medium" title={trip.arrival_address}>
                      {trip.arrival_address}
                    </td>
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{trip.distance_km} km</td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={trip.refuel_box_id || trip.matchedRefuelBox?.id || ''}
                          onChange={(e) => onUpdateRefuelBoxAssignment(tripId, e.target.value)}
                          className="text-xs font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                          {refuelBoxes.map((box) => (
                            <option key={box.id} value={box.id}>
                              ⛽ {box.notes} ({box.fuel_price_per_liter} €/l)
                            </option>
                          ))}
                        </select>
                        {trip.isBoxDateMismatched && (
                          <span
                            title={trip.warningMessage}
                            className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md cursor-help"
                          >
                            ⚠️ Inconformità
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={trip.category}
                        onChange={(e) => onUpdatedCategoryWrapper(tripId, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${badgeColor}`}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.label}>{cat.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-600 text-right whitespace-nowrap">
                      {formatCurrency(trip.calculated_cost || 0)}
                    </td>
                    <td className="px-4 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onDeleteTrip(tripId)}
                        title="Elimina viaggio"
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-rose-50 cursor-pointer"
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

  function onUpdatedCategoryWrapper(tripId: string, newCat: string) {
    onUpdateCategory(tripId, newCat);
  }
};