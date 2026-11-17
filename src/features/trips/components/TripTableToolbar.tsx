import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import type { TableDensity } from '../hooks/useTripTable';

interface TripTableToolbarProps {
  selectedCount: number;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  onDeleteSelected: () => void;
  onReimburseSelected?: () => void;
}

export const TripTableToolbar: React.FC<TripTableToolbarProps> = ({
  selectedCount,
  density,
  onDensityChange,
  onDeleteSelected,
  onReimburseSelected,
}) => {
  if (selectedCount === 0) {
    return (
      <div className={`hidden md:flex ${styles.toolbarWrapper}`}>
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-slate-700">Modalità vista:</span>
          <div className={styles.densityToggleContainer}>
            <button
              type="button"
              onClick={() => onDensityChange('compact')}
              className={styles.densityButton(density === 'compact')}
            >
              Compatta
            </button>
            <button
              type="button"
              onClick={() => onDensityChange('expanded')}
              className={styles.densityButton(density === 'expanded')}
            >
              Estesa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.toolbarWrapper}>
      <div className="hidden md:flex items-center space-x-3">
        <span className="font-semibold text-slate-700">Modalità vista:</span>
        <div className={styles.densityToggleContainer}>
          <button
            type="button"
            onClick={() => onDensityChange('compact')}
            className={styles.densityButton(density === 'compact')}
          >
            Compatta
          </button>
          <button
            type="button"
            onClick={() => onDensityChange('expanded')}
            className={styles.densityButton(density === 'expanded')}
          >
            Estesa
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto justify-between md:justify-end">
        <span className="font-bold text-slate-700">
          {selectedCount} {selectedCount === 1 ? 'selezionato' : 'selezionati'}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {onReimburseSelected && (
            <button
              type="button"
              onClick={onReimburseSelected}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Segna Rimborsati
            </button>
          )}
          <button
            type="button"
            onClick={onDeleteSelected}
            className={styles.deleteButton}
          >
            Elimina
          </button>
        </div>
      </div>
    </div>
  );
};