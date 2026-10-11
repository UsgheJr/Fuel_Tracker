import React, { useState } from 'react';
import type { RefuelBox } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';

interface RefuelBoxListProps {
  refuelBoxes: RefuelBox[];
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export const RefuelBoxList: React.FC<RefuelBoxListProps> = ({ refuelBoxes, onAddRefuelBox, onUpdateRefuelBox }) => {
  const [price, setPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    if (editingId) {
      // Modifica box esistente
      const existing = refuelBoxes.find(b => b.id === editingId);
      if (existing) {
        onUpdateRefuelBox({
          ...existing,
          fuel_price_per_liter: parsedPrice,
          notes: notes || existing.notes,
          refuel_date: new Date(date).toISOString(),
        });
      }
      setEditingId(null);
    } else {
      // Nuovo box
      const newBox: RefuelBox = {
        id: crypto.randomUUID(),
        refuel_date: new Date(date).toISOString(),
        fuel_price_per_liter: parsedPrice,
        notes: notes || 'Rifornimento standard',
      };
      onAddRefuelBox(newBox);
    }

    setPrice('');
    setNotes('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const startEdit = (box: RefuelBox) => {
    setEditingId(box.id);
    setPrice(String(box.fuel_price_per_liter));
    setNotes(box.notes || '');
    setDate(box.refuel_date.split('T')[0]);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Box Rifornimenti & Prezzi</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            {refuelBoxes.length} registrati
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700">{editingId ? 'Modifica Box Rifornimento' : 'Nuovo Box Rifornimento'}</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nome / Note</label>
              <input
                type="text"
                placeholder="es. Eni"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Prezzo (€/l)</label>
              <input
                type="text"
                placeholder="1.859"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              {editingId ? 'Salva Modifiche' : 'Aggiungi Box'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setPrice(''); setNotes(''); }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {refuelBoxes.map((box) => (
          <div key={box.id} className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-sm shadow-2xs">
            <div>
              <span className="font-semibold text-slate-900 block text-xs">{box.notes}</span>
              <span className="text-[11px] text-slate-400">{new Date(box.refuel_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-600 text-sm">
                {formatCurrency(box.fuel_price_per_liter)}<span className="text-xs text-slate-400 font-normal">/l</span>
              </span>
              <button
                onClick={() => startEdit(box)}
                className="text-xs text-indigo-600 hover:underline p-1 cursor-pointer"
              >
                Modifica
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};