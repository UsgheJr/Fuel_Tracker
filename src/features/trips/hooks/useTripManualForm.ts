import { useState } from 'react';
import type { Trip, RefuelBox, ConsumptionUnit } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';

interface UseTripManualFormProps {
  refuelBoxes: RefuelBox[];
  categories: TripCategory[];
  currentUserId: string;
  onAddTrip: (trip: Trip) => void;
  onClose?: () => void;
}

export function useTripManualForm({
  refuelBoxes,
  categories,
  currentUserId,
  onAddTrip,
  onClose,
}: UseTripManualFormProps) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentTimeStr = today.toTimeString().slice(0, 5);

  const [date, setDate] = useState<string>(todayStr);
  const [time, setTime] = useState<string>(currentTimeStr);
  const [distanceKm, setDistanceKm] = useState<string>('');
  const [consumption, setConsumption] = useState<string>('');
  const [consumptionUnit, setConsumptionUnit] = useState<ConsumptionUnit>('l/100km');
  const [category, setCategory] = useState<TripCategory>(categories[0] || 'Lavoro');
  // Utilizziamo refuelBoxes per impostare eventualmente il primo box disponibile come valore di default
  const [refuelBoxId, setRefuelBoxId] = useState<string>(refuelBoxes[0]?.id || '');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsedDistance = parseFloat(distanceKm.replace(',', '.')) || 0;
    const parsedConsumption = consumption ? parseFloat(consumption.replace(',', '.')) : 0;

    if (parsedDistance <= 0) {
      setError('Inserisci una distanza in km valida maggiore di zero.');
      return;
    }

    const timePart = time ? time : '00:00';
    const combinedDateTime = new Date(`${date}T${timePart}:00`).toISOString();

    const newTrip: Trip = {
      id: crypto.randomUUID(),
      user_id: currentUserId,
      departure_time: combinedDateTime,
      arrival_time: combinedDateTime,
      distance_km: parsedDistance,
      fuel_efficiency_kpl: parsedConsumption > 0 ? parsedConsumption : undefined,
      consumption_unit: consumptionUnit,
      category: category,
      refuel_box_id: refuelBoxId !== '' ? refuelBoxId : undefined,
      notes: notes.trim() || undefined,
    };

    try {
      setLoading(true);
      onAddTrip(newTrip);
      setSuccess(true);
      if (onClose) onClose();
    } catch {
      setError('Errore durante la creazione del viaggio.');
    } finally {
      setLoading(false);
    }
  };

  return {
    date,
    setDate,
    time,
    setTime,
    distanceKm,
    setDistanceKm,
    consumption,
    setConsumption,
    consumptionUnit,
    setConsumptionUnit,
    category,
    setCategory,
    refuelBoxId,
    setRefuelBoxId,
    notes,
    setNotes,
    loading,
    error,
    success,
    handleSubmit,
  };
}