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
  const [spentAmount, setSpentAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentTimeStr = today.toTimeString().slice(0, 5);

  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(currentTimeStr);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.'));
    const parsedSpent = spentAmount ? parseFloat(spentAmount.replace(',', '.')) : undefined;

    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const timePart = time ? time : '00:00';
    const combinedDateTime = new Date(`${date}T${timePart}:00`).toISOString();

    if (editingId) {
      const existing = refuelBoxes.find(b => b.id === editingId);
      if (existing) {
        onUpdateRefuelBox({
          ...existing,
          fuel_price_per_liter: parsedPrice,
          spent_amount: parsedSpent,
          notes: notes || existing.notes,
          refuel_date: combinedDateTime,
        });
      }
      setEditingId(null);
    } else {
      const newBox: RefuelBox = {
        id: crypto.randomUUID(),
        refuel_date: combinedDateTime,
        fuel_price_per_liter: parsedPrice,
        spent_amount: parsedSpent,
        notes: notes || 'Rifornimento standard',
      };
      onAddRefuelBox(newBox);
    }

    setPrice('');
    setSpentAmount('');
    setNotes('');
    setDate(todayStr);
    setTime(currentTimeStr);
  };

  const startEdit = (box: RefuelBox) => {
    setEditingId(box.id);
    setPrice(String(box.fuel_price_per_liter));
    setSpentAmount(box.spent_amount ? String(box.spent_amount) : '');
    setNotes(box.notes || '');
    
    const d = new Date(box.refuel_date);
    setDate(d.toISOString().split('T')[0]);
    setTime(d.toTimeString().slice(0, 5));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800">Box Rifornimenti & Prezzi (FIFO)</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            {refuelBoxes.length} registrati
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-700">{editingId ? 'Modifica Box Rifornimento' : 'Nuovo Box Rifornimento'}</p>
          
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nome / Note *</label>
            <input
              type="text"
              placeholder="es. Eni Fisciano"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Ora *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Spesa (€) (Es. 10)</label>
              <input
                type="text"
                placeholder="10"
                value={spentAmount}
                onChange={(e) => setSpentAmount(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Prezzo (€/l) *</label>
              <input
                type="text"
                placeholder="1.999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              {editingId ? 'Salva Modifiche' : 'Aggiungi Box'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); setPrice(''); setSpentAmount(''); setNotes(''); }}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
              >
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {refuelBoxes.map((box) => {
          const d = new Date(box.refuel_date);
          const formattedDateTime = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          const liters = box.spent_amount ? (box.spent_amount / box.fuel_price_per_liter).toFixed(2) : null;

          return (
            <div key={box.id} className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-sm shadow-2xs">
              <div>
                <span className="font-semibold text-slate-900 block text-xs">{box.notes}</span>
                <span className="text-[10px] text-slate-400">
                  🕒 {formattedDateTime} {liters ? `• 💧 ${liters} litri` : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-emerald-600 text-sm">
                  {box.spent_amount ? formatCurrency(box.spent_amount) : `${box.fuel_price_per_liter} €/l`}
                </span>
                <button
                  onClick={() => startEdit(box)}
                  className="text-xs text-indigo-600 hover:underline p-1 cursor-pointer"
                >
                  Modifica
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};