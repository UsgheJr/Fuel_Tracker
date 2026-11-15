export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      refuel_boxes: {
        Row: {
          id: string;
          user_id: string;
          refuel_date: string;
          fuel_price_per_liter: number;
          spent_amount: number | null;
          liters_added: number;
          total_cost: number | null;
          person_name: string | null;
          notes: string | null;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          refuel_date: string;
          fuel_price_per_liter: number;
          spent_amount?: number | null;
          liters_added: number;
          total_cost?: number | null;
          person_name?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['refuel_boxes']['Insert']>;
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          departure_time: string;
          arrival_time: string | null;
          departure_address: string | null;
          arrival_address: string | null;
          distance_km: number;
          fuel_efficiency_kpl: number | null;
          average_consumption: number | null;
          consumption_unit: string | null;
          refuel_box_id: string | null;
          calculated_cost: number | null;
          category: string;
          notes: string | null;
          created_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          departure_time: string;
          arrival_time?: string | null;
          departure_address?: string | null;
          arrival_address?: string | null;
          distance_km: number;
          fuel_efficiency_kpl?: number | null;
          average_consumption?: number | null;
          consumption_unit?: string | null;
          refuel_box_id?: string | null;
          calculated_cost?: number | null;
          category?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['trips']['Insert']>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];