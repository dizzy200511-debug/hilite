import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { deviceId } from './device';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Without Supabase keys the app runs in local mode: data stays on this device only. */
export const LOCAL_MODE = !url || !anonKey;

export const supabase: SupabaseClient | null = LOCAL_MODE
  ? null
  : createClient(url!, anonKey!, {
      auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: !__DESKTOP__ },
      // The device ID travels with every request; the database uses it to check this device is trusted.
      global: { headers: { 'x-device-id': deviceId() } },
    });

export const SITE_URL = import.meta.env.VITE_SITE_URL || (typeof location !== 'undefined' ? location.origin : '');
