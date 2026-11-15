import React, { useEffect } from 'react';
import { useRefuelBox } from '../hooks/useRefuelBox';
import { tripManualFormStyles as formStyles } from '../../trips/styles/tripManualFormStyles';
import { refuelModalStyles as styles } from '../styles/refuelModalStyles';
import type { RefuelBox } from '../../../shared/types';

interface RefuelFormModalProps {
  isOpen: boolean;
  boxToEdit: RefuelBox | null;
  refuelBoxes: RefuelBox[];
  currentUserId: string;
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
  onClose: () => void;
}

export const RefuelFormModal: React.FC<RefuelFormModalProps> = ({
  isOpen,
  boxToEdit,
  refuelBoxes,
  currentUserId,
  onAddRefuelBox,
  onUpdateRefuelBox,
  onClose,
}) => {
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

  useEffect(() => {
    if (!isOpen) return;
    if (boxToEdit) {
      startEdit(boxToEdit);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, boxToEdit]);

  if (!isOpen) return null;

  const onFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBoxSmall} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>
            {editingId ? 'Modifica Rifornimento' : 'Nuovo Rifornimento'}
          </h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <form onSubmit={onFormSubmit} className="space-y-4">
          <div className={formStyles.rowGrid}>
            <div>
              <label className={formStyles.label}>Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={formStyles.input}
                required
              />
            </div>
            <div>
              <label className={formStyles.label}>Orario</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={formStyles.input}
                required
              />
            </div>
          </div>

          <div className={formStyles.rowGrid}>
            <div>
              <label className={formStyles.label}>Prezzo al Litro (€)</label>
              <input
                type="number"
                step="0.001"
                placeholder="es. 1.859"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={formStyles.input}
                required
              />
            </div>
            <div>
              <label className={formStyles.label}>Importo Speso (€) [Opz.]</label>
              <input
                type="number"
                step="0.01"
                placeholder="es. 50.00"
                value={spentAmount}
                onChange={(e) => setSpentAmount(e.target.value)}
                className={formStyles.input}
              />
            </div>
          </div>

          <div className={formStyles.fieldGroup}>
            <label className={formStyles.label}>Note / Descrizione</label>
            <input
              type="text"
              placeholder="es. Pieno Eni"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={formStyles.input}
            />
          </div>

          <button type="submit" className={formStyles.submitButton}>
            {editingId ? 'Aggiorna Rifornimento' : 'Salva Rifornimento'}
          </button>
          <button type="button" onClick={onClose} className={formStyles.cancelButton}>
            Annulla
          </button>
        </form>
      </div>
    </div>
  );
};