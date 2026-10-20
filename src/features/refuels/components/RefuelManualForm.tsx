// src/features/refuels/components/RefuelManualForm.tsx

import React from 'react';
import { useRefuelForm } from '../hooks/useRefuelForm';
import { refuelFormStyles as styles } from '../styles/refuelFormStyles';
import type { RefuelBoxInput } from '../../../shared/types';

interface RefuelManualFormProps {
  onSubmitRefuel: (data: RefuelBoxInput) => Promise<void>;
}

export const RefuelManualForm: React.FC<RefuelManualFormProps> = ({ onSubmitRefuel }) => {
  const {
    refuelDate,
    setRefuelDate,
    spentAmount,
    setSpentAmount,
    pricePerLiter,
    setPricePerLiter,
    notes,
    setNotes,
    calculatedLiters,
    loading,
    error,
    success,
    handleSubmit,
  } = useRefuelForm({ onSubmit: onSubmitRefuel });

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Registra Nuovo Rifornimento</h3>

      {success && <div className={styles.successMessage}>Rifornimento salvato con successo!</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Data Rifornimento</label>
          <input
            type="date"
            value={refuelDate}
            onChange={(e) => setRefuelDate(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Importo Speso (€)</label>
          <input
            type="number"
            step="0.01"
            placeholder="es. 50.00"
            value={spentAmount}
            onChange={(e) => setSpentAmount(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Prezzo al Litro (€/L)</label>
          <input
            type="number"
            step="0.001"
            placeholder="es. 1.859"
            value={pricePerLiter}
            onChange={(e) => setPricePerLiter(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        {/* Anteprima calcolata dei litri aggiunti */}
        <div className={styles.calculatedBox}>
          <span>Litri stimati immessi:</span>
          <span className={styles.calculatedValue}>{calculatedLiters} L</span>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Note (Opzionale)</label>
          <input
            type="text"
            placeholder="es. ENI Autostrada"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Salvataggio in corso...' : 'Salva Rifornimento'}
        </button>
      </form>
    </div>
  );
};