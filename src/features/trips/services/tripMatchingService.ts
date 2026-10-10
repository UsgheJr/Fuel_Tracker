import type { Trip, RefuelBox } from '../../../shared/types';
import { calculateTripCost } from './tripCostCalculator';

export function enrichTripsWithCosts(trips: Trip[], refuelBoxes: RefuelBox[]): Trip[] {
  // Se non ci sono box rifornimento, usiamo un prezzo di fallback (es. 1.859 €/l)
  const FALLBACK_PRICE = 1.859;

  // Ordiniamo i box per data crescente per facilitare il matching cronologico
  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
  );

  return trips.map((trip) => {
    const tripDate = new Date(trip.departure_time).getTime();

    // Trova il box rifornimento attivo per questo viaggio 
    // (l'ultimo rifornimento effettuato prima o durante la data del viaggio)
    let activePrice = FALL_BACK_PRICE(FALLBACK_PRICE); // fallback

    const matchingBox = sortedBoxes.reverse().find(box => new Date(box.refuel_date).getTime() <= tripDate);
    if (matchingBox) {
      activePrice = matchingBox.fuel_price_per_liter;
    } else if (sortedBoxes.length > 0) {
      // Se il viaggio è precedente al primo rifornimento registrato, usiamo il primo disponibile
      activePrice = sortedBoxes[sortedBoxes.length - 1].fuel_price_per_liter;
    }

    const cost = calculateTripCost(trip.distance_km, trip.average_consumption_l_100km, activePrice);

    return {
      ...trip,
      calculated_cost: cost,
    };
  });
}

// Funzione di supporto per il fallback del prezzo
function FALL_BACK_PRICE(price: number): number {
  return price;
}