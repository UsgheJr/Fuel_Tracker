import React, { useState } from 'react';
import type { RefuelBox } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';

interface RefuelBoxListProps {
  refuelBoxes: RefuelBox[];
  onAddRefuelBox: (box: RefuelBox) => void;
}

export const RefuelBoxList: React.FC<RefuelBoxListProps> = ({ refuelBoxes, onAddRefuelBox }) => {
  const [price, setPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(',', '.'));
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) return;

    const newBox: RefuelBox = {
      id: crypto.randomUUID(),
      refuel_date: new Date().toISOString(),
      fuel_price_per_liter: parsedPrice,
      notes: notes || 'Rifornimento standard',
    };

    onAddRefuelBox(newBox);
    setPrice('');
    setNotes('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Box Rifornimenti & Prezzi Benzina</h3>
      
      {/* Form di inserimento rapido rifornimento */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Prezzo Benzina (€/litro)</label>
          <input
            type="text"
            placeholder="es. 1.859"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Note / Stazione</label>
          <input
            type="text"
            placeholder="es. Eni Fisciano"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
        >
          Aggiungi Box
        </button>
      </form>

      {/* Lista dei box attivi */}
      <div className="divide-y divide-gray-100 mt-4">
        {refuelBoxes.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Nessun box rifornimento configurato. Verrà usato un prezzo predefinito.</p>
        ) : (
          refuelBoxes.map((box) => (
            <div key={box.id} className="py-2 flex justify-between items-center text-sm">
              <div>
                <span className="font-medium text-gray-900">{box.notes}</span>
                <span className="text-xs text-gray-500 block">{new Date(box.refuel_date).toLocaleDateString()}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-700">{formatCurrency(box.fuel_price_per_liter)} / l</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};