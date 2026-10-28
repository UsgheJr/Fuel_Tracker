export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConfigured: boolean;
}

/**
 * Recupera e valida le variabili d'ambiente per il client Supabase.
 * Supporta sia Vite (import.meta.env) che Next.js / ambienti Node (process.env).
 */
export function getAppConfig(): AppConfig {
  const supabaseUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co'
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
  };
}