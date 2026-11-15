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

export function calculateReimbursementSummary(trips: EnrichedTrip[]): ReimbursementSummary {
  let pendingAmount = 0;
  let pendingTripsCount = 0;
  const pendingByBoxId = new Map<string, { amount: number; count: number }>();

  for (const trip of trips) {
    if (!isPendingReimbursement(trip)) continue;

    const cost = trip.cost || 0;
    pendingAmount += cost;
    pendingTripsCount += 1;

    const effectiveBoxId = trip.refuel_box_id || trip.matchedRefuelBox?.id;
    if (effectiveBoxId) {
      const current = pendingByBoxId.get(effectiveBoxId) ?? { amount: 0, count: 0 };
      pendingByBoxId.set(effectiveBoxId, {
        amount: Number((current.amount + cost).toFixed(2)),
        count: current.count + 1,
      });
    }
  }

  return {
    pendingAmount: Number(pendingAmount.toFixed(2)),
    pendingTripsCount,
    pendingByBoxId,
  };
}