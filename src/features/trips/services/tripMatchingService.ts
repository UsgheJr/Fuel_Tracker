// src/features/trips/services/tripMatchingService.ts

import type { Trip, RefuelBox } from '../../../shared/types';
import { normalizeToLitersPer100Km } from '../../../shared/utils/fuelConverter';

export interface EnrichedTrip extends Trip {
  calculated_cost?: number;
  matchedRefuelBox?: RefuelBox;
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
const DEFAULT_KPL = 15;
const DEFAULT_TANK_LITERS = 50.0;

function initializeTankBatches(sortedBoxes: RefuelBox[]): TankBatch[] {
  if (sortedBoxes.length === 0) {
    return [{
      boxId: 'fallback',
      boxNotes: 'Prezzo Standard',
      pricePerLiter: FALLBACK_PRICE,
      remainingLiters: 999999,
      date: 0,
    }];
  }

  return sortedBoxes.map(box => {
    const price = box.price_per_liter ?? FALLBACK_PRICE;
    const spent = box.spent_amount ?? ((box.liters ?? DEFAULT_TANK_LITERS) * price);
    const liters = spent > 0 && price > 0 ? spent / price : (box.liters ?? DEFAULT_TANK_LITERS);

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
  const explicitBox = refuelBoxes.find(b => b.id === trip.refuel_box_id);
  if (!explicitBox) return null;

  const litersPer100Km = normalizeToLitersPer100Km(trip.fuel_efficiency_kpl, trip.consumption_unit);
  const litersNeeded = (trip.distance_km * litersPer100Km) / 100;  
  const activePrice = explicitBox.price_per_liter ?? FALLBACK_PRICE;
  const totalCost = litersNeeded * activePrice;

  const boxTime = new Date(explicitBox.refuel_date).getTime();
  const isMismatch = tripTime < boxTime;
  const warningMsg = isMismatch 
    ? `Incongruenza: Il box "${explicitBox.notes || 'Rifornimento'}" è del ${new Date(explicitBox.refuel_date).toLocaleDateString()}, successivo alla data del viaggio.`
    : '';

  return {
    totalCost,
    primaryMatchedBox: explicitBox,
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
  const kpl = trip.fuel_efficiency_kpl && trip.fuel_efficiency_kpl > 0 ? trip.fuel_efficiency_kpl : DEFAULT_KPL;
  let remainingToConsume = trip.distance_km / kpl;
  let totalCost = 0;
  let primaryMatchedBox: RefuelBox | undefined = undefined;
  let consumedFromAnyValid = false;

  for (const batch of tankBatches) {
    if (batch.date <= tripTime && batch.remainingLiters > 0) {
      const takeFromThis = Math.min(remainingToConsume, batch.remainingLiters);
      totalCost += takeFromThis * batch.pricePerLiter;
      batch.remainingLiters -= takeFromThis;
      remainingToConsume -= takeFromThis;

      if (!primaryMatchedBox) {
        primaryMatchedBox = sortedBoxes.find(b => b.id === batch.boxId);
      }
      consumedFromAnyValid = true;

      if (remainingToConsume <= 0) break;
    }
  }

  if (remainingToConsume > 0) {
    const fallbackBatch = tankBatches[tankBatches.length - 1];
    totalCost += remainingToConsume * fallbackBatch.pricePerLiter;
    if (!primaryMatchedBox) {
      primaryMatchedBox = sortedBoxes.find(b => b.id === fallbackBatch.boxId);
    }
  }

  if (!consumedFromAnyValid && sortedBoxes.length > 0) {
    primaryMatchedBox = sortedBoxes[0];
  }

  return { totalCost, primaryMatchedBox };
}

export function enrichTripsWithCosts(trips: Trip[], refuelBoxes: RefuelBox[]): EnrichedTrip[] {
  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
  );

  const indexedTrips = trips.map((trip, originalIndex) => ({
    trip,
    originalIndex,
    tripTime: new Date(trip.departure_time).getTime(),
  })).sort((a, b) => a.tripTime - b.tripTime);

  const tankBatches = initializeTankBatches(sortedBoxes);
  const resultsMap = new Map<number, EnrichedTrip>();

  for (const item of indexedTrips) {
    const { trip, originalIndex, tripTime } = item;
    
    let totalCost = 0;
    let primaryMatchedBox: RefuelBox | undefined = undefined;
    let isMismatch = false;
    let warningMsg = '';

    if (trip.refuel_box_id) {
      const explicitResult = handleExplicitBoxMatch(trip, tripTime, refuelBoxes);
      if (explicitResult) {
        totalCost = explicitResult.totalCost;
        primaryMatchedBox = explicitResult.primaryMatchedBox;
        isMismatch = explicitResult.isMismatch;
        warningMsg = explicitResult.warningMsg;
      }
    } else {
      const fifoResult = handleFifoConsumption(trip, tripTime, tankBatches, sortedBoxes);
      totalCost = fifoResult.totalCost;
      primaryMatchedBox = fifoResult.primaryMatchedBox;
    }

    const roundedCost = Math.ceil(totalCost * 1000) / 1000;

    resultsMap.set(originalIndex, {
      ...trip,
      calculated_cost: roundedCost,
      matchedRefuelBox: primaryMatchedBox,
      isBoxDateMismatched: isMismatch,
      warningMessage: warningMsg,
    });
  }

  return trips.map((_, idx) => resultsMap.get(idx)!).filter(Boolean);
}