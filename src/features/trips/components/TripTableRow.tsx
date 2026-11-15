import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import { reimbursementStyles } from '../../reimbursements/styles/reimbursementStyles';
import { formatDateTime, formatCurrency } from '../../../shared/utils/formatters';
import type { EnrichedTrip } from '../services/tripMatchingService';
import type { TableDensity } from '../hooks/useTripTable';

interface TripTableRowProps {
  trip: EnrichedTrip;
  density: TableDensity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReimburseSingle?: (tripId: string) => void;
}

export const TripTableRow: React.FC<TripTableRowProps> = ({
  trip,
  density,
  isSelected,
  onSelect,
  onReimburseSingle,
}) => {
  const isCompact = density === 'compact';
  const isWorkCategory = trip.category.trim().toLowerCase() === 'lavoro';

  const consumptionValue = trip.fuel_efficiency_kpl;
  const consumptionDisplay =
    consumptionValue && consumptionValue > 0
      ? `${consumptionValue} ${trip.consumption_unit || 'l/100km'}`
      : 'N/D';

  return (
    <tr className={styles.row(isSelected)}>
      <td className={styles.td}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(trip.id)}
          className={styles.checkbox}
        />
      </td>
      <td className={styles.td + ' font-medium'}>
        {formatDateTime(trip.departure_time)}
      </td>
      <td className={styles.td}>{trip.distance_km} km</td>
      <td className={styles.td}>
        <span className={styles.badgeCategory}>{trip.category}</span>
        {isWorkCategory && (
          <div className="mt-1.5 flex items-center flex-wrap gap-1">
            {trip.is_reimbursed ? (
              <span className={reimbursementStyles.badgeDone}>Rimborsato</span>
            ) : (
              <>
                <span className={reimbursementStyles.badgePending}>Da rimborsare</span>
                {onReimburseSingle && (
                  <button
                    type="button"
                    onClick={() => onReimburseSingle(trip.id)}
                    className={reimbursementStyles.btnQuickSettle}
                  >
                    Salda
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </td>
      <td className={styles.td}>{consumptionDisplay}</td>
      <td className={styles.td + ' font-extrabold text-emerald-700'}>
        {trip.cost !== undefined ? formatCurrency(trip.cost) : '-'}
      </td>
      {!isCompact && (
        <>
          <td className={styles.td}>{trip.departure_address || '-'}</td>
          <td className={styles.td}>{trip.arrival_address || '-'}</td>
          <td className={styles.td}>
            <div>{trip.notes || '-'}</div>
            {trip.warningMessage && (
              <div className={styles.badgeWarning}>{trip.warningMessage}</div>
            )}
          </td>
        </>
      )}
    </tr>
  );
};