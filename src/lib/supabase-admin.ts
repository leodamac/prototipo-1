import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL");
}
if (!serviceKey) {
  throw new Error("Missing environment variable SUPABASE_SERVICE_ROLE_KEY");
}

// Note: this client is for server-side use only and should not be exposed to the browser.
export const supabaseAdmin = createClient(supabaseUrl, serviceKey);
