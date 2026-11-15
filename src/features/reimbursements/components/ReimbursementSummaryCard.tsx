import React, { useState } from 'react';
import { reimbursementStyles as styles } from '../styles/reimbursementStyles';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { RefuelBox } from '../../../shared/types';
import type { ReimbursementSummary } from '../services/reimbursementCalculator';

interface ReimbursementSummaryCardProps {
  summary: ReimbursementSummary;
  filteredSummary: ReimbursementSummary;
  refuelBoxes: RefuelBox[];
  hasActiveFilters: boolean;
  onReimburseBox: (boxId: string) => void;
  onReimburseFilteredPeriod: () => void;
}

export const ReimbursementSummaryCard: React.FC<ReimbursementSummaryCardProps> = ({
  summary,
  filteredSummary,
  refuelBoxes,
  hasActiveFilters,
  onReimburseBox,
  onReimburseFilteredPeriod,
}) => {
  const [selectedBoxToSettle, setSelectedBoxToSettle] = useState<string>('');

  const boxesWithPending = refuelBoxes.filter((b) => summary.pendingByBoxId.has(b.id));

  const handleSettleBox = () => {
    if (!selectedBoxToSettle) return;
    onReimburseBox(selectedBoxToSettle);
    setSelectedBoxToSettle('');
  };

  return (
    <section className={styles.bannerWrapper}>
      <div className={styles.kpiSection}>
        <p className={styles.kpiLabel}>Rimborsi Lavoro Ancora da Ricevere</p>
        <div className={styles.kpiValueRow}>
          <span className={styles.kpiAmount}>{formatCurrency(summary.pendingAmount)}</span>
          <span className={styles.kpiSubtext}>
            ({summary.pendingTripsCount}{' '}
            {summary.pendingTripsCount === 1 ? 'viaggio lavoro in sospeso' : 'viaggi lavoro in sospeso'})
          </span>
        </div>
      </div>

      {summary.pendingTripsCount > 0 && (
        <div className={styles.controlsGrid}>
          {/* 1. Salda un intero Box Rifornimento */}
          {boxesWithPending.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedBoxToSettle}
                onChange={(e) => setSelectedBoxToSettle(e.target.value)}
                className={styles.boxSelect}
              >
                <option value="">Seleziona Box da saldare...</option>
                {boxesWithPending.map((box) => {
                  const info = summary.pendingByBoxId.get(box.id)!;
                  return (
                    <option key={box.id} value={box.id}>
                      {box.notes || 'Rifornimento'} — {formatCurrency(info.amount)} ({info.count} viaggi)
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                disabled={!selectedBoxToSettle}
                onClick={handleSettleBox}
                className={styles.btnActionPrimary}
              >
                Salda Box
              </button>
            </div>
          )}

          {/* 2. Salda l'intero Periodo / Vista Filtrata */}
          {hasActiveFilters && filteredSummary.pendingTripsCount > 0 && (
            <button
              type="button"
              onClick={onReimburseFilteredPeriod}
              className={styles.btnActionSecondary}
            >
              Salda Periodo Filtrato ({formatCurrency(filteredSummary.pendingAmount)})
            </button>
          )}
        </div>
      )}
    </section>
  );
};