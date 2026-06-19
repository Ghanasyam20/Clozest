// Lazy-loaded admin client to avoid localStorage access during build
let adminInstance: Awaited<ReturnType<typeof getSupabaseAdminAsync>> | null = null;

async function getSupabaseAdminAsync() {
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Server-only admin client (bypasses RLS — use only in Route Handlers / Server Actions)
export async function getSupabaseAdmin() {
  if (!adminInstance) {
    adminInstance = await getSupabaseAdminAsync();
  }
  return adminInstance;
}

// Storage bucket names
export const BUCKETS = {
  WARDROBE: "wardrobe-items",
  AVATARS:  "avatars",
  OUTFITS:  "outfit-assets",
} as const;
