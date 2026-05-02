import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// Define a general rate limiter: 60 requests per 1 minute per IP
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/signup", "/verify-email"];
const publicApiRoutes = ["/api/auth/session", "/api/auth/reset", "/api/stripe/webhook", "/api/cron/streak-reminder"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // For API routes — check for auth headers (actual validation happens in the route handler)
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const sessionToken = req.headers.get("x-session-token");

    if (!authHeader || !sessionToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Apply Rate Limiting based on IP (skip in development for better performance)
    if (process.env.NODE_ENV !== "development") {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      try {
        const { success, limit, reset, remaining } = await ratelimit.limit(ip);
        
        if (!success) {
          return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { 
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": reset.toString(),
              }
            }
          );
        }
      } catch (error) {
        console.error("Rate limit error:", error);
        // Proceed if Redis is down so we don't break the whole app
      }
    }

    return NextResponse.next();
  }

  // For page routes — we can't do full Firebase+Redis validation in Edge middleware
  // Instead, the layout/page components handle auth via client-side checks
  // This middleware just ensures the basic flow
  return NextResponse.next();
}

export const config = {
  // Only run proxy on API routes.
  // Page route auth is already handled client-side by guards.
  matcher: ["/api/:path*"],
};
