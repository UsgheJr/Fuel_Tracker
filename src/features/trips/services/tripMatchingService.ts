// Sostituisci il contenuto di src/features/trips/services/tripMatchingService.ts con:
import type { Trip, RefuelBox } from '../../../shared/types';

export interface EnrichedTrip extends Trip {
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

export function enrichTripsWithCosts(trips: Trip[], refuelBoxes: RefuelBox[]): EnrichedTrip[] {
  const FALLBACK_PRICE = 1.859;

  // 1. Ordiniamo i rifornimenti cronologicamente dal più vecchio al più recente
  const sortedBoxes = [...refuelBoxes].sort(
    (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
  );

  // 2. Ordiniamo i viaggi cronologicamente per simulare il consumo reale nel tempo
  const indexedTrips = trips.map((trip, originalIndex) => ({
    trip,
    originalIndex,
    tripTime: new Date(trip.departure_time).getTime(),
  })).sort((a, b) => a.tripTime - b.tripTime);

  // Prepariamo una mappa per memorizzare i risultati indicizzati per l'ordine originale
  const resultsMap = new Map<number, EnrichedTrip>();

  // Inizializziamo il serbatoio FIFO con i lotti di carburante disponibili
  let tankBatches: TankBatch[] = sortedBoxes.map(box => {
    // Se l'utente ha inserito la spesa, calcoliamo i litri. Se no, diamo una stufa di default generosa (es. 50 litri)
    const liters = box.spent_amount && box.spent_amount > 0 
      ? box.spent_amount / box.fuel_price_per_liter 
      : 50.0;

    return {
      boxId: box.id,
      boxNotes: box.notes || 'Rifornimento',
      pricePerLiter: box.fuel_price_per_liter,
      remainingLiters: liters,
      date: new Date(box.refuel_date).getTime(),
    };
  });

  // Se non ci sono box, creiamo un lotto di fallback
  if (tankBatches.length === 0) {
    tankBatches.push({
      boxId: 'fallback',
      boxNotes: 'Prezzo Standard',
      pricePerLiter: FALLBACK_PRICE,
      remainingLiters: 999999,
      date: 0,
    });
  }

  // 3. Iteriamo sui viaggi in ordine cronologico consumando il serbatoio FIFO
  for (const item of indexedTrips) {
    const { trip, originalIndex, tripTime } = item;
    
    // Calcoliamo i litri consumati dal viaggio
    const kpl = trip.fuel_efficiency_kpl && trip.fuel_efficiency_kpl > 0 
      ? trip.fuel_efficiency_kpl 
      : 15; // Un valore di default di sicurezza (es. 15 km/l) se non specificato

    const litersNeeded = trip.distance_km / kpl;
    
    let remainingToConsume = litersNeeded;
    let totalCost = 0;
    let primaryMatchedBox: RefuelBox | undefined = undefined;
    let isMismatch = false;
    let warningMsg = '';

    // Se l'utente ha forzato un box specifico per questo viaggio
    if (trip.refuel_box_id) {
      const explicitBox = refuelBoxes.find(b => b.id === trip.refuel_box_id);
      if (explicitBox) {
        primaryMatchedBox = explicitBox;
        const activePrice = explicitBox.fuel_price_per_liter;
        totalCost = litersNeeded * activePrice;
        
        const boxTime = new Date(explicitBox.refuel_date).getTime();
        if (tripTime < boxTime) {
          isMismatch = true;
          warningMsg = `Inconformità: Il box "${explicitBox.notes}" è del ${new Date(explicitBox.refuel_date).toLocaleDateString()}, successivo alla data del viaggio.`;
        }
      }
    } else {
      // Logica FIFO: preleviamo dai lotti disponibili la cui data è <= alla data del viaggio
      let consumedFromAnyValid = false;

      for (const batch of tankBatches) {
        // Consideriamo solo i lotti di rifornimento avvenuti prima o nello stesso momento del viaggio
        if (batch.date <= tripTime && batch.remainingLiters > 0) {
          const takeFromThis = Math.min(remainingToConsume, batch.remainingLiters);
          totalCost += takeFromThis * batch.pricePerLiter;
          batch.remainingLiters -= takeFromThis;
          remainingToConsume -= takeFromThis;

          if (!primaryMatchedBox) {
            primaryMatchedBox = refuelBoxes.find(b => b.id === batch.boxId);
          }
          consumedFromAnyValid = true;

          if (remainingToConsume <= 0) break;
        }
      }

      // Se non ci sono abbastanza litri nei lotti passati, usiamo il prezzo dell'ultimo lotto disponibile o fallback
      if (remainingToConsume > 0) {
        const fallbackBatch = tankBatches[tankBatches.length - 1];
        totalCost += remainingToConsume * fallbackBatch.pricePerLiter;
        if (!primaryMatchedBox) {
          primaryMatchedBox = refuelBoxes.find(b => b.id === fallbackBatch.boxId);
        }
      }

      if (!consumedFromAnyValid && sortedBoxes.length > 0) {
        primaryMatchedBox = sortedBoxes[0];
      }
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

  // Restituiamo i viaggi ordinati nel loro indice originale
  return trips.map((_, idx) => resultsMap.get(idx)!).filter(Boolean);
}