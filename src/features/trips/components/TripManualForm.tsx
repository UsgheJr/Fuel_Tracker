// src/features/trips/components/TripManualForm.tsx

import React from 'react';
import { useTripManualForm } from '../hooks/useTripMaualForm';
import { tripManualFormStyles as styles } from '../styles/tripManualFormStyles';
import type { Trip, RefuelBox, ConsumptionUnit } from '../../../shared/types';
import type { TripCategory } from '../../../shared/types/categories';

interface TripManualFormProps {
  refuelBoxes: RefuelBox[];
  categories: TripCategory[];
  currentUserId: string;
  onAddTrip: (trip: Trip) => void;
  onClose?: () => void;
}

export const TripManualForm: React.FC<TripManualFormProps> = ({
  refuelBoxes,
  categories,
  currentUserId,
  onAddTrip,
  onClose,
}) => {
  const {
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
  } = useTripManualForm({
    refuelBoxes,
    categories,
    currentUserId,
    onAddTrip,
    onClose,
  });

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Inserisci Viaggio Manuale</h3>

      {success && <div className={styles.successMessage}>Viaggio aggiunto con successo!</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.rowGrid}>
          <div>
            <label className={styles.label}>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div>
            <label className={styles.label}>Orario</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Distanza (km)</label>
          <input
            type="number"
            step="0.1"
            placeholder="es. 45.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.rowGrid}>
          <div>
            <label className={styles.label}>Consumo Medio</label>
            <input
              type="number"
              step="0.1"
              placeholder="es. 6.5"
              value={consumption}
              onChange={(e) => setConsumption(e.target.value)}
              className={styles.input}
            />
          </div>
          <div>
            <label className={styles.label}>Unità</label>
            <select
              value={consumptionUnit}
              onChange={(e) => setConsumptionUnit(e.target.value as ConsumptionUnit)}
              className={styles.select}
            >
              <option value="l/100km">l/100km</option>
              <option value="km/l">km/l</option>
            </select>
          </div>
        </div>

        <div className={styles.rowGrid}>
          <div>
            <label className={styles.label}>Categoria</label>
            <select
              value={category as string} 
              onChange={(e) => setCategory(e.target.value as TripCategory)}
              className={styles.select}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.label}>Rifornimento Collegato</label>
            <select
              value={refuelBoxId}
              onChange={(e) => setRefuelBoxId(e.target.value)}
              className={styles.select}
            >
              <option value="">(Automatico / FIFO)</option>
              {refuelBoxes.map((box) => (
                <option key={box.id} value={box.id}>
                  {box.notes || box.refuel_date} ({box.price_per_liter} €/L)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Note (Opzionale)</label>
          <input
            type="text"
            placeholder="es. Trasferta cliente"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Salvataggio...' : 'Salva Viaggio'}
        </button>

        {onClose && (
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Annulla
          </button>
        )}
      </form>
    </div>
  );
};