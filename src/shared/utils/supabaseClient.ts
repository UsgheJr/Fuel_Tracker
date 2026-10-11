import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jbxtfbonkuofmtpfegti.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_t5HAdeEudxBIxe9V-v3SYw_J_nidVr5';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);