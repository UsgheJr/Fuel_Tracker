import { useMemo, useCallback } from 'react';
import {
  calculateReimbursementSummary,
  isPendingReimbursement,
  tripMatchesRefuelBox
} from '../services/reimbursementCalculator';
import type { Trip } from '../../../shared/types';
import type { EnrichedTrip } from '../../trips/services/tripMatchingService';

interface UseReimbursementsProps {
  rawTrips: Trip[];
  enrichedTrips: EnrichedTrip[];
  filteredTrips: EnrichedTrip[];
  onUpdateTripsBatch: (updatedTrips: Trip[]) => void;
}

export function useReimbursements({
  rawTrips,
  enrichedTrips,
  filteredTrips,
  onUpdateTripsBatch,
}: UseReimbursementsProps) {
  const summary = useMemo(
    () => calculateReimbursementSummary(enrichedTrips),
    [enrichedTrips]
  );

  const filteredPendingSummary = useMemo(
    () => calculateReimbursementSummary(filteredTrips),
    [filteredTrips]
  );

  const markTripIdsAsReimbursed = useCallback(
    (targetIds: Set<string>) => {
      if (targetIds.size === 0) return;
      const nowIso = new Date().toISOString();

      const tripsToUpdate = rawTrips
        .filter((t) => targetIds.has(t.id) && !t.is_reimbursed)
        .map((t) => ({
          ...t,
          is_reimbursed: true,
          reimbursed_at: nowIso,
        }));

      if (tripsToUpdate.length > 0) {
        onUpdateTripsBatch(tripsToUpdate);
      }
    },
    [rawTrips, onUpdateTripsBatch]
  );

  // 1. Granularità Singolo Viaggio
  const reimburseSingleTrip = useCallback(
    (tripId: string) => {
      markTripIdsAsReimbursed(new Set([tripId]));
    },
    [markTripIdsAsReimbursed]
  );

  // 2. Granularità Multipla (selezione manuale da tabella)
  const reimburseSelectedTrips = useCallback(
    (tripIds: string[]) => {
      const workPendingIds = new Set(
        enrichedTrips
          .filter((t) => tripIds.includes(t.id) && isPendingReimbursement(t))
          .map((t) => t.id)
      );
      markTripIdsAsReimbursed(workPendingIds);
    },
    [enrichedTrips, markTripIdsAsReimbursed]
  );

  // 3. Granularità Intero Box Rifornimento
  const reimburseByRefuelBox = useCallback(
    (boxId: string) => {
      const boxTripIds = new Set(
        enrichedTrips
          .filter((t) => tripMatchesRefuelBox(t, boxId) && isPendingReimbursement(t))
          .map((t) => t.id)
      );
      markTripIdsAsReimbursed(boxTripIds);
    },
    [enrichedTrips, markTripIdsAsReimbursed]
  );

  // 4. Granularità Intero Periodo / Filtri Attivi
  const reimburseFilteredPeriod = useCallback(() => {
    const periodTripIds = new Set(
      filteredTrips.filter(isPendingReimbursement).map((t) => t.id)
    );
    markTripIdsAsReimbursed(periodTripIds);
  }, [filteredTrips, markTripIdsAsReimbursed]);

  return {
    summary,
    filteredPendingSummary,
    reimburseSingleTrip,
    reimburseSelectedTrips,
    reimburseByRefuelBox,
    reimburseFilteredPeriod,
  };
}