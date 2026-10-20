import React from 'react';
import type { RefuelBox } from '../../../shared/types';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useRefuelBox } from '../../hooks/useRefuelBox';
import { refuelBoxStyles as styles } from '../styles/refuelBoxStyles';

interface RefuelBoxListProps {
  refuelBoxes: RefuelBox[];
  onAddRefuelBox: (box: RefuelBox) => void;
  onUpdateRefuelBox: (updatedBox: RefuelBox) => void;
}

export const RefuelBoxList: React.FC<RefuelBoxListProps> = ({ refuelBoxes, onAddRefuelBox, onUpdateRefuelBox }) => {
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
  } = useRefuelBox({ refuelBoxes, onAddRefuelBox, onUpdateRefuelBox });

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.headerWrapper}>
          <h3 className={styles.title}>Box Rifornimenti & Prezzi (FIFO)</h3>
          <span className={styles.badge}>{refuelBoxes.length} registrati</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.formTitle}>{editingId ? 'Modifica Box Rifornimento' : 'Nuovo Box Rifornimento'}</p>
          
          <div>
            <label className={styles.label}>Nome / Note *</label>
            <input
              type="text"
              placeholder="es. Eni Fisciano"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.gridTwo}>
            <div>
              <label className={styles.label}>Data *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div>
              <label className={styles.label}>Ora *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div>
              <label className={styles.label}>Spesa (€) (Es. 10)</label>
              <input
                type="text"
                placeholder="10.00"
                value={spentAmount}
                onChange={(e) => setSpentAmount(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label className={styles.label}>Prezzo (€/l) *</label>
              <input
                type="text"
                placeholder="1.999"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              {editingId ? 'Salva Modifiche' : 'Aggiungi Box'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className={styles.cancelButton}>
                Annulla
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.listContainer}>
        {refuelBoxes.map((box) => {
          const d = new Date(box.refuel_date);
          const formattedDateTime = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          const liters = box.spent_amount && box.fuel_price_per_liter 
            ? (box.spent_amount / box.fuel_price_per_liter).toFixed(2) 
            : box.liters_added?.toFixed(2);

          return (
            <div key={box.id} className={styles.listItem}>
              <div>
                <span className={styles.itemNotes}>{box.notes}</span>
                <span className={styles.itemSubtext}>
                  🕒 {formattedDateTime} {liters ? `• 💧 ${liters} litri` : ''}
                </span>
              </div>
              <div className={styles.itemPriceContainer}>
                <div>
                  <span className={styles.itemAmount}>
                    {box.spent_amount ? formatCurrency(box.spent_amount) : '-'}
                  </span>
                  <span className={styles.itemPricePerLiter}>
                    {box.fuel_price_per_liter} €/l
                  </span>
                </div>
                <button onClick={() => startEdit(box)} className={styles.editButton}>
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