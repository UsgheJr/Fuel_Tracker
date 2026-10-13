export interface RefuelBox {
  id: string;
  refuel_date: string;
  fuel_price_per_liter: number;
  liters_added?: number;
  total_cost?: number;
  notes?: string;
}

export interface Trip {
  id?: string;
  departure_address: string;
  departure_time: string;
  arrival_address: string;
  arrival_time: string;
  distance_km: number;
  average_consumption_l_100km: number;
  consumption_unit?: 'l/100km' | 'l/km';
  category: string;
  calculated_cost?: number;
  refuel_box_id?: string;             
  isBoxDateMismatched?: boolean;   
  warningMessage?: string;           
}