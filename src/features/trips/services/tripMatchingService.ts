import type { Trip, RefuelBox } from '../../../shared/types';
import { calculateTripCost } from './tripCostCalculator';

export interface EnrichedTrip extends Trip {
  matchedRefuelBox?: RefuelBox;
  isBoxDateMismatched?: boolean;
  warningMessage?: string;
}

export function enrichTripsWithCosts(trips: Trip[], refuelBoxes: RefuelBox[]): EnrichedTrip[] {
  const FALLBACK_PRICE = 1.859;

  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
  );

  return trips.map((trip) => {
    const tripTime = new Date(trip.departure_time).getTime();
    let activePrice = FALLBACK_PRICE;
    let matchedBox: RefuelBox | undefined = undefined;
    let isMismatch = false;
    let warningMsg = '';

    if (trip.refuel_box_id) {
      const explicitBox = refuelBoxes.find(b => b.id === trip.refuel_box_id);
      if (explicitBox) {
        matchedBox = explicitBox;
        activePrice = explicitBox.fuel_price_per_liter;
        const boxTime = new Date(explicitBox.refuel_date).getTime();
        if (tripTime < boxTime) {
          isMismatch = true;
          warningMsg = `Inconformità: Il box "${explicitBox.notes}" è del ${new Date(explicitBox.refuel_date).toLocaleDateString()}, successivo alla data del viaggio.`;
        }
      }
    } else {
      if (sortedBoxes.length > 0) {
        const validBox = sortedBoxes
          .slice()
          .reverse()
          .find((box) => new Date(box.refuel_date).getTime() <= tripTime);

        if (validBox) {
          matchedBox = validBox;
          activePrice = validBox.fuel_price_per_liter;
        } else {
          matchedBox = sortedBoxes[0];
          activePrice = sortedBoxes[0].fuel_price_per_liter;
        }
      }
    }

    // Passiamo l'unità di misura (default 'l/100km' se non specificata)
    const unit = trip.consumption_unit || 'l/100km';
    const cost = calculateTripCost(trip.distance_km, trip.average_consumption_l_100km, activePrice, unit);

    return {
      ...trip,
      calculated_cost: cost,
      matchedRefuelBox: matchedBox,
      isBoxDateMismatched: isMismatch,
      warningMessage: warningMsg,
    };
  });
}