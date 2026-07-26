import { createClient } from "@supabase/supabase-js";

// This URL + key pair is meant to be public. Real protection comes from
// Row Level Security policies on the tables (see the SQL you already ran),
// never from hiding this key. Do NOT put the service_role key here — ever.
const SUPABASE_URL = "https://ynkatectozpkvhexvfzb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_38zJh9RZlHeZTc1wIfTIug_9jK46ix5";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
