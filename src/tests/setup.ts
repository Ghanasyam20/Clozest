import "@testing-library/jest-dom";
import { vi } from "vitest";
import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
// ── Mock Next.js router ───────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter:      () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  usePathname:    () => "/",
  useSearchParams:() => new URLSearchParams(),
  redirect:       vi.fn(),
}));

// ── Mock next-auth ────────────────────────────────────────────────────────────
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data:   { user: { id: "test-user-id", email: "test@example.com", name: "Test User" } },
    status: "authenticated",
  }),
  signIn:  vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// ── Mock fetch ────────────────────────────────────────────────────────────────
global.fetch = vi.fn();

// ── Suppress console.error in tests (expected errors) ────────────────────────
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
    originalError(...args);
  };
});
afterAll(() => { console.error = originalError; });
