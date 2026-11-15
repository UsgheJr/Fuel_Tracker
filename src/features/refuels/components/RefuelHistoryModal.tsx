import React from 'react';
import { useRefuelHistoryFilter } from '../hooks/useRefuelHistoryFilter';
import { refuelModalStyles as styles } from '../styles/refuelModalStyles';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { RefuelBox } from '../../../shared/types';

interface RefuelHistoryModalProps {
  isOpen: boolean;
  refuelBoxes: RefuelBox[];
  onEditBox: (box: RefuelBox) => void;
  onClose: () => void;
}

export const RefuelHistoryModal: React.FC<RefuelHistoryModalProps> = ({
  isOpen,
  refuelBoxes,
  onEditBox,
  onClose,
}) => {
  const {
    formattedMonthLabel,
    goToPrevMonth,
    goToNextMonth,
    resetToCurrentMonth,
    searchQuery,
    setSearchQuery,
    filteredBoxes,
    monthlyTotals,
  } = useRefuelHistoryFilter(refuelBoxes);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalBoxLarge} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Storico Rifornimenti</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {/* Selettore Mensile con Frecce */}
        <div className={styles.monthNavWrapper}>
          <button type="button" onClick={goToPrevMonth} className={styles.navArrowBtn}>
            ← Precedente
          </button>
          <button
            type="button"
            onClick={resetToCurrentMonth}
            title="Torna al mese corrente"
            className={`${styles.monthLabel} cursor-pointer hover:text-indigo-600`}
          >
            {formattedMonthLabel}
          </button>
          <button type="button" onClick={goToNextMonth} className={styles.navArrowBtn}>
            Successivo →
          </button>
        </div>

        {/* Filtro rapido testuale */}
        <input
          type="text"
          placeholder="Filtra per nota o prezzo al litro (es. FABIO_NOV o 1.999)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        {/* Riepilogo sintetico del mese selezionato */}
        <div className={styles.summaryStrip}>
          <span>
            Rifornimenti nel mese: <strong>{filteredBoxes.length}</strong>
          </span>
          <span>
            Totale: <strong>{monthlyTotals.totalLiters.toFixed(2)} L</strong> (
            {formatCurrency(monthlyTotals.totalSpent)})
          </span>
        </div>

        {/* Elenco filtrato */}
        <div className={styles.listScrollArea}>
          {filteredBoxes.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400 italic">
              Nessun rifornimento registrato per {formattedMonthLabel}.
            </p>
          ) : (
            filteredBoxes.map((box) => (
              <div key={box.id} className={styles.listItem}>
                <div>
                  <p className="font-bold text-slate-800 text-xs">
                    {box.notes || 'Rifornimento'} —{' '}
                    <span className="text-indigo-600">{box.price_per_liter} €/L</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Litri: {box.liters} L | Spesa:{' '}
                    {box.spent_amount ? formatCurrency(box.spent_amount) : 'N/D'} | Data:{' '}
                    {formatDate(box.refuel_date)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onEditBox(box)}
                  className={styles.editLinkBtn}
                >
                  Modifica
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};