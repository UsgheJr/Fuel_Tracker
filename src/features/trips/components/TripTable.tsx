import React from 'react';
import type { Trip } from '../../../shared/types';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';

interface TripTableProps {
  trips: Trip[];
}

export const TripTable: React.FC<TripTableProps> = ({ trips }) => {
  if (trips.length === 0) {
    return <p className="text-gray-500 text-center py-6 bg-white rounded-lg border border-gray-200">Nessun viaggio trovato con i filtri selezionati.</p>;
  }

  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700">Data</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Partenza</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Destinazione</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Distanza</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Consumo</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Categoria</th>
            <th className="px-4 py-3 font-semibold text-gray-700">Costo Viaggio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {trips.map((trip, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(trip.departure_time)}
              </td>
              <td className="px-4 py-3 text-gray-900 truncate max-w-xs" title={trip.departure_address}>
                {trip.departure_address}
              </td>
              <td className="px-4 py-3 text-gray-900 truncate max-w-xs" title={trip.arrival_address}>
                {trip.arrival_address}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{trip.distance_km} km</td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{trip.average_consumption_l_100km} l/100km</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{trip.category}</span>
              </td>
              <td className="px-4 py-3 font-semibold text-green-700 whitespace-nowrap">
                {formatCurrency(trip.calculated_cost || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};