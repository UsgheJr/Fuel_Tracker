import React, { useState } from 'react';
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
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Box KPI di Riepilogo: 3 colonne compatte anche su mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Costo Filtrato
          </p>
          <p className="text-base sm:text-2xl font-extrabold text-emerald-600 mt-0.5 sm:mt-1">
            {formatCurrency(totalCost)}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Km Totali
          </p>
          <p className="text-base sm:text-2xl font-extrabold text-indigo-600 mt-0.5 sm:mt-1">
            {totalKm.toFixed(1)} km
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
            Viaggi
          </p>
          <p className="text-base sm:text-2xl font-extrabold text-slate-800 mt-0.5 sm:mt-1">
            {totalTrips}
          </p>
        </div>
      </div>

      {/* Pulsante Toggle Filtri visibile solo su Smartphone (< 640px) */}
      <button
        type="button"
        onClick={() => setIsMobileExpanded((prev) => !prev)}
        className="sm:hidden w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl shadow-2xs text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer"
      >
        <span>Filtra Viaggi (Categoria, Box, Date)</span>
        <span className="text-indigo-600">{isMobileExpanded ? 'Nascondi ▲' : 'Mostra ▼'}</span>
      </button>

      {/* Pannello Filtri Avanzati */}
      <div
        className={`${
          isMobileExpanded ? 'grid' : 'hidden'
        } sm:grid bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs`}
      >
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

        <div>
          <label className="block font-semibold text-slate-600 mb-1">Box Rifornimento</label>
          <select
            value={selectedBoxId}
            onChange={(e) => onBoxChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tutti i box</option>
            {refuelBoxes.map((box) => (
              <option key={box.id} value={box.id}>
                {box.notes} ({box.price_per_liter} €/l)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-600 mb-1">Da Data</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

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