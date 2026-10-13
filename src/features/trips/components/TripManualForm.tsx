import React, { useState } from 'react';
import type { Trip, RefuelBox } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';

interface TripManualFormProps {
  refuelBoxes: RefuelBox[];
  categories: TripCategory[];
  onAddTrip: (trip: Trip) => void;
  onClose?: () => void;
}

export const TripManualForm: React.FC<TripManualFormProps> = ({
  refuelBoxes,
  categories,
  onAddTrip,
  onClose,
}) => {
  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(b.refuel_date).getTime() - new Date(a.refuel_date).getTime()
  );
  const defaultBoxId = sortedBoxes.length > 0 ? sortedBoxes[0].id : '';

  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [refuelBoxId, setRefuelBoxId] = useState(defaultBoxId);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateStr, setDateStr] = useState(todayStr);
  const [timeStr, setTimeStr] = useState('12:00');

  const [distance, setDistance] = useState('');
  const [consumption, setConsumption] = useState('5.5');
  const [consumptionUnit, setConsumptionUnit] = useState<'l/100km' | 'l/km'>('l/100km');
  const [category, setCategory] = useState(categories[0]?.label || 'Personale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departure || !arrival || !distance || !refuelBoxId) return;

    const parsedDistance = parseFloat(distance.replace(',', '.'));
    const parsedConsumption = parseFloat(consumption.replace(',', '.'));

    if (isNaN(parsedDistance) || isNaN(parsedConsumption)) return;

    const timePart = timeStr ? timeStr : '00:00';
    const combinedDateTime = new Date(`${dateStr}T${timePart}:00`).toISOString();

    const newTrip: Trip = {
      departure_address: departure,
      departure_time: combinedDateTime,
      arrival_address: arrival,
      arrival_time: combinedDateTime,
      distance_km: parsedDistance,
      average_consumption_l_100km: parsedConsumption,
      consumption_unit: consumptionUnit, // Salviamo l'unità scelta
      category: category,
      refuel_box_id: refuelBoxId,
    };

    onAddTrip(newTrip);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 w-full max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Aggiungi Viaggio Manualmente</h3>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Partenza *</label>
          <input
            type="text"
            placeholder="es. Via Roma 1, Salerno"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Destinazione *</label>
          <input
            type="text"
            placeholder="es. Via Milano 10, Napoli"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Data (Giorno) *</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ora (Opzionale)</label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Chilometri *</label>
            <input
              type="text"
              placeholder="es. 34.5"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Consumo *</label>
            <input
              type="text"
              placeholder="es. 5.5"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unità</label>
            <select
              value={consumptionUnit}
              onChange={(e) => setConsumptionUnit(e.target.value as 'l/100km' | 'l/km')}
              className="w-full px-2 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="l/100km">l/100km</option>
              <option value="l/km">l/km</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Box di Riferimento *</label>
            <select
              value={refuelBoxId}
              onChange={(e) => setRefuelBoxId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            >
              {sortedBoxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.notes} ({box.fuel_price_per_liter} €/l)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Categoria (Opzionale)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.label}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
            >
              Annulla
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            Salva Viaggio
          </button>
        </div>
      </form>
    </div>
  );
};