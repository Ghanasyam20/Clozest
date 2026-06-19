"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Lazy initialization to avoid localStorage access at module load time
let instance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!instance) {
    instance = createClient(supabaseUrl, supabaseAnon);
  }
  return instance;
}

// For compatibility, also export as named export but lazy
export const supabase = new Proxy(
  {},
  {
    get: (_target, prop) => {
      return getSupabaseClient()[prop as keyof ReturnType<typeof createClient>];
    },
  }
) as ReturnType<typeof createClient>;

