import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  updatedAt?: string;
}

export type AuthUser = SupabaseUser;
export type AuthSession = SupabaseSession;

export interface AuthResponse {
  user: AuthUser | null;
  session: AuthSession | null;
  error: Error | null;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  signOut: (syncCallback?: () => Promise<void>) => Promise<void>;
}