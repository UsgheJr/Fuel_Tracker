import type { Trip, RefuelBox } from '../../../shared/types';
import { calculateFuelNeeded } from '../../../shared/utils/fuelConverter';

export interface BoxCostAllocation {
  boxId: string;
  amount: number;
}

export interface EnrichedTrip extends Trip {
  calculated_cost?: number;
  matchedRefuelBox?: RefuelBox;
  allocations: BoxCostAllocation[];
  isBoxDateMismatched?: boolean;
  warningMessage?: string;
}

interface TankBatch {
  boxId: string;
  boxNotes: string;
  pricePerLiter: number;
  remainingLiters: number;
  date: number;
}

const FALLBACK_PRICE = 1.859;
const DEFAULT_TANK_LITERS = 50.0;

function initializeTankBatches(sortedBoxes: RefuelBox[]): TankBatch[] {
  if (sortedBoxes.length === 0) {
    return [
      {
        boxId: 'fallback',
        boxNotes: 'Prezzo Standard',
        pricePerLiter: FALLBACK_PRICE,
        remainingLiters: 999999,
        date: 0,
      },
    ];
  }

  return sortedBoxes.map((box) => {
    const price = box.price_per_liter ?? FALLBACK_PRICE;
    const spent = box.spent_amount ?? (box.liters ?? DEFAULT_TANK_LITERS) * price;
    const liters =
      spent > 0 && price > 0 ? spent / price : box.liters ?? DEFAULT_TANK_LITERS;

    return {
      boxId: box.id,
      boxNotes: box.notes || 'Rifornimento',
      pricePerLiter: price,
      remainingLiters: liters,
      date: new Date(box.refuel_date).getTime(),
    };
  });
}

function handleExplicitBoxMatch(
  trip: Trip,
  tripTime: number,
  refuelBoxes: RefuelBox[]
) {
  const explicitBox = refuelBoxes.find((b) => b.id === trip.refuel_box_id);
  if (!explicitBox) return null;

  const litersNeeded = calculateFuelNeeded(
    trip.distance_km,
    trip.fuel_efficiency_kpl,
    trip.consumption_unit
  );
  const activePrice = explicitBox.price_per_liter ?? FALLBACK_PRICE;
  const totalCost = litersNeeded * activePrice;

  const boxTime = new Date(explicitBox.refuel_date).getTime();
  const isMismatch = tripTime < boxTime;
  const warningMsg = isMismatch
    ? `Incongruenza: Il box "${explicitBox.notes || 'Rifornimento'}" è del ${new Date(
        explicitBox.refuel_date
      ).toLocaleDateString()}, successivo alla data del viaggio.`
    : '';

  return {
    totalCost,
    primaryMatchedBox: explicitBox,
    allocations: [{ boxId: explicitBox.id, amount: Math.round(totalCost * 100) / 100 }],
    isMismatch,
    warningMsg,
  };
}

function handleFifoConsumption(
  trip: Trip,
  tripTime: number,
  tankBatches: TankBatch[],
  sortedBoxes: RefuelBox[]
) {
  let remainingToConsume = calculateFuelNeeded(
    trip.distance_km,
    trip.fuel_efficiency_kpl,
    trip.consumption_unit
  );

  let totalCost = 0;
  let primaryMatchedBox: RefuelBox | undefined = undefined;
  const allocations: BoxCostAllocation[] = [];

  for (const batch of tankBatches) {
    if (batch.date <= tripTime && batch.remainingLiters > 0) {
      const takeFromThis = Math.min(remainingToConsume, batch.remainingLiters);
      const sliceCost = takeFromThis * batch.pricePerLiter;

      totalCost += sliceCost;
      batch.remainingLiters -= takeFromThis;
      remainingToConsume -= takeFromThis;

      if (batch.boxId !== 'fallback') {
        allocations.push({
          boxId: batch.boxId,
          amount: Math.round(sliceCost * 100) / 100,
        });
        if (!primaryMatchedBox) {
          primaryMatchedBox = sortedBoxes.find((b) => b.id === batch.boxId);
        }
      }

      if (remainingToConsume <= 0) break;
    }
  }

  // Eventuale eccedenza oltre i litri disponibili nei rifornimenti registrati:
  // usa l'ultimo prezzo noto (o fallback) SENZA gonfiare il conto di un box già esaurito
  if (remainingToConsume > 0) {
    const validPastBatches = tankBatches.filter(
      (b) => b.date <= tripTime && b.boxId !== 'fallback'
    );
    const referencePrice =
      validPastBatches.length > 0
        ? validPastBatches[validPastBatches.length - 1].pricePerLiter
        : FALLBACK_PRICE;

    totalCost += remainingToConsume * referencePrice;
  }

  return { totalCost, primaryMatchedBox, allocations };
}

export function enrichTripsWithCosts(
  trips: Trip[],
  refuelBoxes: RefuelBox[]
): EnrichedTrip[] {
  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
  );

  const indexedTrips = trips
    .map((trip, originalIndex) => ({
      trip,
      originalIndex,
      tripTime: new Date(trip.departure_time).getTime(),
    }))
    .sort((a, b) => a.tripTime - b.tripTime);

  const tankBatches = initializeTankBatches(sortedBoxes);
  const resultsMap = new Map<number, EnrichedTrip>();

  for (const item of indexedTrips) {
    const { trip, originalIndex, tripTime } = item;
    let totalCost = 0;
    let primaryMatchedBox: RefuelBox | undefined = undefined;
    let allocations: BoxCostAllocation[] = [];
    let isMismatch = false;
    let warningMsg = '';

    if (trip.refuel_box_id) {
      const explicitResult = handleExplicitBoxMatch(trip, tripTime, refuelBoxes);
      if (explicitResult) {
        totalCost = explicitResult.totalCost;
        primaryMatchedBox = explicitResult.primaryMatchedBox;
        allocations = explicitResult.allocations;
        isMismatch = explicitResult.isMismatch;
        warningMsg = explicitResult.warningMsg;
      }
    } else {
      const fifoResult = handleFifoConsumption(trip, tripTime, tankBatches, sortedBoxes);
      totalCost = fifoResult.totalCost;
      primaryMatchedBox = fifoResult.primaryMatchedBox;
      allocations = fifoResult.allocations;
    }

    const roundedCost = Math.round(totalCost * 100) / 100;

    resultsMap.set(originalIndex, {
      ...trip,
      cost: roundedCost,
      calculated_cost: roundedCost,
      matchedRefuelBox: primaryMatchedBox,
      allocations,
      isBoxDateMismatched: isMismatch,
      warningMessage: warningMsg,
    });
  }

  return trips.map((_, idx) => resultsMap.get(idx)!).filter(Boolean);
}