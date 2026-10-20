export interface RefuelBox {
  id: string;
  refuel_date: string;          // Data e ora del rifornimento
  fuel_price_per_liter: number; // Prezzo al litro (es. 1.999)
  spent_amount?: number;        // Denaro speso in totale (es. 10.00)
  liters_added?: number;        // Litri imbarcati (calcolato o inserito)
  notes?: string;
}

export interface Trip {
  id?: string;
  departure_time: string;
  departure_address: string;
  arrival_address: string;
  arrival_time: string;
  distance_km: number;
  fuel_efficiency_kpl?: number;
  calculated_cost?: number;     
  category: string;
  refuel_box_id?: string;
  matchedRefuelBox?: RefuelBox;
}