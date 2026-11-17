import type { EnrichedTrip } from '../../trips/services/tripMatchingService';

export interface ReimbursementSummary {
  pendingAmount: number;
  pendingTripsCount: number;
  pendingByBoxId: Map<string, { amount: number; count: number }>;
}

export function isWorkTrip(trip: EnrichedTrip): boolean {
  return trip.category.trim().toLowerCase() === 'lavoro';
}

export function isPendingReimbursement(trip: EnrichedTrip): boolean {
  return isWorkTrip(trip) && !trip.is_reimbursed;
}

/**
 * Verifica se un viaggio ha consumato carburante (anche parzialmente) da uno specifico box.
 */
export function tripMatchesRefuelBox(trip: EnrichedTrip, boxId: string): boolean {
  if (trip.refuel_box_id === boxId || trip.matchedRefuelBox?.id === boxId) {
    return true;
  }
  return Boolean(trip.allocations?.some((a) => a.boxId === boxId && a.amount > 0));
}

export function calculateReimbursementSummary(trips: EnrichedTrip[]): ReimbursementSummary {
  let pendingAmount = 0;
  let pendingTripsCount = 0;
  const pendingByBoxId = new Map<string, { amount: number; count: number }>();

  for (const trip of trips) {
    if (!isPendingReimbursement(trip)) continue;

    const cost = trip.cost || 0;
    pendingAmount += cost;
    pendingTripsCount += 1;

    if (trip.allocations && trip.allocations.length > 0) {
      for (const alloc of trip.allocations) {
        if (alloc.amount <= 0) continue;
        const current = pendingByBoxId.get(alloc.boxId) ?? { amount: 0, count: 0 };
        pendingByBoxId.set(alloc.boxId, {
          amount: Number((current.amount + alloc.amount).toFixed(2)),
          count: current.count + 1,
        });
      }
    }
  }

  return {
    pendingAmount: Number(pendingAmount.toFixed(2)),
    pendingTripsCount,
    pendingByBoxId,
  };
}