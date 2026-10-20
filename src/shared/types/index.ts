// src/shared/types/index.ts

// src/shared/types/index.ts

export interface Trip {
  id: string;
  user_id: string;
  departure_time: string;
  distance_km: number;
  fuel_efficiency_kpl?: number;
  refuel_box_id?: string;
  cost?: number;
  category: string;
  notes?: string;
  created_at?: string;
}

export interface RefuelBox {
  id: string;
  refuel_date: string;
  liters?: number;
  price_per_liter: number;
  spent_amount?: number;
  notes?: string;
  created_at?: string;
}

export type TripInput = Omit<Trip, 'id' | 'user_id' | 'created_at'>;
export type RefuelBoxInput = Omit<RefuelBox, 'id' | 'user_id' | 'created_at'>;

export interface UserSession {
  id: string;
  email: string;
}