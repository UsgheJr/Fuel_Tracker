import { supabase } from '../../../database/supabaseClient';
import { LocalStorageService } from '../../../shared/services/storage/localStorageService';
import type { AuthResponse, AuthSession, AuthUser } from '../../../shared/types/auth';

export class AuthService {
  /**
   * Recupera la sessione corrente dell'utente
   */
  static async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Errore nel recupero della sessione:', error);
      return null;
    }
  }

  /**
   * Recupera l'utente attualmente autenticato
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Errore nel recupero dell\'utente corrente:', error);
      return null;
    }
  }

  /**
   * Autenticazione tramite Email e Password
   */
  static async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Errore durante l\'accesso');
      console.error('SignIn error:', error.message);
      return { user: null, session: null, error };
    }
  }

  /**
   * Registrazione nuovo utente
   */
  static async signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Errore durante la registrazione');
      console.error('SignUp error:', error.message);
      return { user: null, session: null, error };
    }
  }

  /**
   * Disconnessione utente (Logout) con Sincronizzazione Preventiva dei dati pendenti
   * @param syncCallback Callback opzionale per forzare la sincronizzazione dati prima del signOut
   */
  static async signOut(syncCallback?: () => Promise<void>): Promise<{ success: boolean; error: Error | null }> {
    try {
      // 1. Esegue il sync dei dati pendenti se fornito dall'orchestratore di persistenza
      if (syncCallback) {
        console.info('Esecuzione sincronizzazione dati pre-logout...');
        await syncCallback();
      }
    } catch (err) {
      console.error('Attenzione: la sincronizzazione pre-logout ha riscontrato un errore:', err);
    } finally {
      try {
        // 2. Termina la sessione Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // 3. Pulizia selettiva dei metadata di sincronizzazione e cache locale
        LocalStorageService.remove('app_last_sync_timestamp');

        return { success: true, error: null };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Errore durante il logout');
        console.error('SignOut error:', error.message);
        return { success: false, error };
      }
    }
  }

  /**
   * Ascolta i cambiamenti di stato dell'autenticazione (login, logout, token refresh)
   */
  static onAuthStateChange(
    callback: (event: string, session: AuthSession | null) => void
  ) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
}