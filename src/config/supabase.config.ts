import { createClient } from '@supabase/supabase-js';
import { env } from './env.config'; // Layer 2 Validator

// Centralized database engine injection point
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // Prevents server-side session caching conflicts
  },
});