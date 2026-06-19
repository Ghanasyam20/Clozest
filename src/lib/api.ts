import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

// ─── Response builders ────────────────────────────────────────────────────────

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json<ApiResponse<T>>({ data, error: null }, { status });
}

export function err(message: string, status = 400): NextResponse {
  return NextResponse.json<ApiResponse<null>>({ data: null, error: message }, { status });
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<
  { userId: string; error: null } | { userId: null; error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { userId: null, error: err("Unauthorised", 401) };
  }
  return { userId: session.user.id, error: null };
}

// ─── Simple in-memory rate limiter ───────────────────────────────────────────
// For production: replace with Upstash Redis or Supabase-backed store.

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit = 60,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now    = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}

// ─── File validation ──────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_FILE_SIZE_MB   = 10;
const MAX_FILE_SIZE_B    = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateImageFile(
  file: File
): { valid: true } | { valid: false; reason: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, reason: `Invalid file type. Allowed: JPG, PNG, WebP, AVIF.` };
  }
  if (file.size > MAX_FILE_SIZE_B) {
    return { valid: false, reason: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` };
  }
  return { valid: true };
}
