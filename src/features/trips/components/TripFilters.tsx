import React from 'react';
import { formatCurrency } from '../../../shared/utils/formatters';

interface TripFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  totalCost: number;
  totalKm: number;
  totalTrips: number;
}

export const TripFilters: React.FC<TripFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  totalCost,
  totalKm,
  totalTrips,
}) => {
  return (
    <div className="space-y-4">
      {/* Box KPI di Riepilogo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Costo Totale Filtrato</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Chilometri Totali</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalKm.toFixed(1)} km</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs font-medium text-gray-500 uppercase">Viaggi Totali</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalTrips}</p>
        </div>
      </div>

      {/* Filtri */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filtra per Categoria:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tutte le categorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};