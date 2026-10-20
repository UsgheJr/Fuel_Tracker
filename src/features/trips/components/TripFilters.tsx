import React from 'react';
import type { RefuelBox } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';

interface TripFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  
  selectedBoxId: string;
  onBoxChange: (boxId: string) => void;
  refuelBoxes: RefuelBox[];

  searchText: string;
  onSearchTextChange: (text: string) => void;

  startDate: string;
  onStartDateChange: (date: string) => void;

  endDate: string;
  onEndDateChange: (date: string) => void;

  totalCost: number;
  totalKm: number;
  totalTrips: number;
}

export const TripFilters: React.FC<TripFiltersProps> = ({
  selectedCategory,
  onCategoryChange,
  categories,
  selectedBoxId,
  onBoxChange,
  refuelBoxes,
  searchText,
  onSearchTextChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  totalCost,
  totalKm,
  totalTrips,
}) => {
  return (
    <div className="space-y-4">
      {/* Box KPI di Riepilogo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Costo Totale Filtrato</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalCost)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chilometri Totali</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{totalKm.toFixed(1)} km</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Viaggi Filtrati</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">{totalTrips}</p>
        </div>
      </div>

      {/* Pannello Filtri Avanzati */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Ricerca Testo (Partenza / Arrivo) */}
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Cerca (Partenza / Arrivo)</label>
          <input
            type="text"
            placeholder="es. Fisciano o Napoli"
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filtro Categoria */}
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Categoria</label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tutte le categorie</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro Box Rifornimento */}
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Box Rifornimento</label>
          <select
            value={selectedBoxId}
            onChange={(e) => onBoxChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tutti i box</option>
            {refuelBoxes.map((box) => (
              <option key={box.id} value={box.id}>{box.notes} ({box.price_per_liter} €/l)</option>
            ))}
          </select>
        </div>

        {/* Filtro Data Inizio */}
        <div>
          <label className="block font-semibold text-slate-600 mb-1">Da Data</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filtro Data Fine */}
        <div>
          <label className="block font-semibold text-slate-600 mb-1">A Data</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};