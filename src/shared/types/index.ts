export type ConsumptionUnit = 'l/100km' | 'km/l' | 'l/km';

import type { TripCategory } from './categories';

export interface Trip {
  id: string;
  user_id: string;
  departure_time: string;
  arrival_time?: string;
  departure_address?: string;
  arrival_address?: string;
  distance_km: number;
  fuel_efficiency_kpl?: number;
  consumption_unit?: ConsumptionUnit;
  refuel_box_id?: string;
  cost?: number;
  category: TripCategory;
  notes?: string;
  created_at?: string;
}

export interface RefuelBox {
  id: string;
  user_id: string;
  refuel_date: string;
  liters: number;
  price_per_liter: number;
  spent_amount: number;
  notes?: string;
  created_at?: string;
}

export type TripInput = Omit<Trip, 'id' | 'user_id' | 'created_at'>;
export type RefuelBoxInput = Omit<RefuelBox, 'id' | 'user_id' | 'created_at'>;