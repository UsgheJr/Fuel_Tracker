import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import type { TableDensity } from '../hooks/useTripTable';

interface TripTableToolbarProps {
  selectedCount: number;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  onDeleteSelected: () => void;
}

export const TripTableToolbar: React.FC<TripTableToolbarProps> = ({
  selectedCount,
  density,
  onDensityChange,
  onDeleteSelected,
}) => {
  return (
    <div className={styles.toolbarWrapper}>
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

      {selectedCount > 0 && (
        <div className="flex items-center space-x-3">
          <span className="font-bold text-slate-700">
            {selectedCount} {selectedCount === 1 ? 'viaggio selezionato' : 'viaggi selezionati'}
          </span>
          <button
            type="button"
            onClick={onDeleteSelected}
            className={styles.deleteButton}
          >
            Elimina Selezionati
          </button>
        </div>
      )}
    </div>
  );
};