import React from 'react';
import { tripTableStyles as styles } from '../styles/tripTableStyles';
import { reimbursementStyles } from '../../reimbursements/styles/reimbursementStyles';
import { formatDateTime, formatCurrency } from '../../../shared/utils/formatters';
import type { EnrichedTrip } from '../services/tripMatchingService';

interface TripMobileCardProps {
  trip: EnrichedTrip;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onReimburseSingle?: (tripId: string) => void;
}

export const TripMobileCard: React.FC<TripMobileCardProps> = ({
  trip,
  isSelected,
  onSelect,
  onReimburseSingle,
}) => {
  const isWorkCategory = trip.category.trim().toLowerCase() === 'lavoro';
  const consumptionDisplay =
    trip.fuel_efficiency_kpl && trip.fuel_efficiency_kpl > 0
      ? `${trip.fuel_efficiency_kpl} ${trip.consumption_unit || 'l/100km'}`
      : 'N/D';

  return (
    <div
      className={`p-3.5 transition-colors ${
        isSelected ? 'bg-indigo-50/70' : 'bg-white'
      }`}
    >
      {/* Riga 1: Checkbox, Data/Ora e Costo */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(trip.id)}
            className={styles.checkbox}
          />
          <div>
            <p className="text-xs font-bold text-slate-800">
              {formatDateTime(trip.departure_time)}
            </p>
            <p className="text-[11px] text-slate-500">
              {trip.distance_km} km • {consumptionDisplay}
            </p>
          </div>
        </div>

        <span className="text-sm font-extrabold text-emerald-700 shrink-0">
          {trip.cost !== undefined ? formatCurrency(trip.cost) : '-'}
        </span>
      </div>

      {/* Riga 2: Tratta / Note (se presenti) */}
      {(trip.departure_address || trip.arrival_address || trip.notes) && (
        <p className="mt-2 pl-6.5 text-[11px] text-slate-600 line-clamp-2">
          {trip.departure_address && trip.arrival_address
            ? `${trip.departure_address} → ${trip.arrival_address}`
            : trip.notes}
        </p>
      )}

      {/* Riga 3: Badge Categoria & Stato Rimborso */}
      <div className="mt-2.5 pl-6.5 flex flex-wrap items-center justify-between gap-2">
        <span className={styles.badgeCategory}>{trip.category}</span>

        {isWorkCategory && (
          <div className="flex items-center gap-1.5">
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
      </div>

      {trip.warningMessage && (
        <div className={`mt-2 ml-6.5 ${styles.badgeWarning}`}>{trip.warningMessage}</div>
      )}
    </div>
  );
};