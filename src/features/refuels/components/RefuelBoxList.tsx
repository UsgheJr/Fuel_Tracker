// src/features/refuels/components/RefuelBoxList.tsx

import React from 'react';
import { useRefuelBox } from '../hooks/useRefuelBox';
import type { RefuelBox } from '../../../shared/types';

interface RefuelBoxListProps {
  refuelBoxes: RefuelBox[];
  currentUserId: string;
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export const RefuelBoxList: React.FC<RefuelBoxListProps> = ({
  refuelBoxes,
  currentUserId,
  onAddRefuelBox,
  onUpdateRefuelBox,
}) => {
  // Destrutturazione corretta delle variabili e funzioni fornite dall'hook
  const {
    price,
    setPrice,
    spentAmount,
    setSpentAmount,
    notes,
    setNotes,
    date,
    setDate,
    time,
    setTime,
    editingId,
    handleSubmit,
    resetForm,
    startEdit,
  } = useRefuelBox({
    refuelBoxes,
    currentUserId,
    onAddRefuelBox,
    onUpdateRefuelBox,
  });

  return (
    <div className="bg-white shadow-lg rounded-xl border border-slate-200 p-6 max-w-xl mx-auto w-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        {editingId ? 'Modifica Rifornimento' : 'Nuovo Rifornimento'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Orario
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Prezzo al Litro (€)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="es. 1.859"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Importo Speso (€) [Opzionale]
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="es. 50.00"
              value={spentAmount}
              onChange={(e) => setSpentAmount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Note / Descrizione
          </label>
          <input
            type="text"
            placeholder="es. Pieno Eni"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {editingId ? 'Aggiorna Rifornimento' : 'Aggiungi Rifornimento'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Annulla
            </button>
          )}
        </div>
      </form>

      {/* Lista dei rifornimenti esistenti */}
      <div className="mt-8">
        <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
          Storico Rifornimenti
        </h4>
        <div className="space-y-2">
          {refuelBoxes.map((box) => (
            <div
              key={box.id}
              className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  {box.notes || 'Rifornimento'} - {box.price_per_liter} €/L
                </p>
                <p className="text-xs text-slate-500">
                  Litri: {box.liters} | Spesa: {box.spent_amount ? `${box.spent_amount} €` : 'N/D'} | Data: {new Date(box.refuel_date).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(box)}
                className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold uppercase cursor-pointer"
              >
                Modifica
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};