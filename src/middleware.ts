import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES  = ["/dashboard", "/closet", "/outfits", "/analytics", "/profile", "/settings"];
const ONBOARDING_PREFIX = "/onboarding";
const AUTH_ROUTES       = ["/login", "/register"];

function isProtectedPath(pathname: string) {
  return (
    PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith(ONBOARDING_PREFIX)
  );
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuth = !!req.nextauth.token;

    // Authenticated users → away from login/register
    if (isAuth && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const response = NextResponse.next();

    // Prevent the browser's back/forward cache (bfcache) from storing a
    // snapshot of authenticated pages. Without this, clicking Back after
    // signing out could briefly show a stale "logged in" view of a
    // protected page before any server check re-runs.
    if (isProtectedPath(pathname)) {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
    }

    return response;
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Always allow public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/api/auth") ||
          AUTH_ROUTES.some((r) => pathname.startsWith(r))
        ) {
          return true;
        }

        // Require auth for protected routes and onboarding
        if (isProtectedPath(pathname)) {
          return !!token;
        }

        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)).*)",
  ],
};
