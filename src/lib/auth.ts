import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { redis, sessionKey, userSessionsKey } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  plan: "FREE" | "PRO";
  role: "USER" | "ADMIN";
  onboardingComplete: boolean;
  isLocked: boolean;
  lockReason: string | null;
  stripeCustomerId: string | null;
  maxUnlockedIndex: number;
  timezone: string;
}

// ─── In-Memory User Cache ────────────────────────────────
// Caches user data for 60 seconds to avoid hitting Postgres on every API call.
// Each stage transition was triggering 3 external round-trips (Firebase → Redis → Postgres).
// This eliminates the Postgres round-trip for subsequent requests within the TTL.

interface CachedUser {
  user: AuthenticatedUser;
  timestamp: number;
}

const USER_CACHE = new Map<string, CachedUser>();
const USER_CACHE_TTL = 60_000; // 60 seconds

function getCachedUser(firebaseUid: string): AuthenticatedUser | null {
  const cached = USER_CACHE.get(firebaseUid);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > USER_CACHE_TTL) {
    USER_CACHE.delete(firebaseUid);
    return null;
  }
  return cached.user;
}

function setCachedUser(firebaseUid: string, user: AuthenticatedUser): void {
  USER_CACHE.set(firebaseUid, { user, timestamp: Date.now() });
}

export function invalidateUserCache(firebaseUid: string): void {
  USER_CACHE.delete(firebaseUid);
}

// ─── Firebase Token Cache ────────────────────────────────
// Firebase token verification is an HTTPS call to Google servers.
// Cache verified tokens for 5 minutes (tokens live for 1 hour).

interface CachedToken {
  uid: string;
  timestamp: number;
}

const TOKEN_CACHE = new Map<string, CachedToken>();
const TOKEN_CACHE_TTL = 300_000; // 5 minutes

interface CachedSession {
  valid: boolean;
  timestamp: number;
}

const SESSION_CACHE = new Map<string, CachedSession>();
const SESSION_CACHE_TTL = 300_000; // 5 minutes

interface CachedAuthResult {
  user: AuthenticatedUser;
  timestamp: number;
}

const AUTH_RESULT_CACHE = new Map<string, CachedAuthResult>();
const AUTH_RESULT_CACHE_TTL = 60_000; // 60 seconds

/**
 * Validates both Firebase JWT AND Redis session for every authenticated request.
 * Returns the authenticated user or an error response.
 */
export async function validateRequest(
  req: NextRequest
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  try {
    // Extract tokens from headers
    const authHeader = req.headers.get("authorization");
    const sessionToken = req.headers.get("x-session-token");

    if (!authHeader?.startsWith("Bearer ") || !sessionToken) {
      return {
        error: NextResponse.json(
          { error: "Missing authentication credentials" },
          { status: 401 }
        ),
      };
    }

    const firebaseToken = authHeader.replace("Bearer ", "");
    const authCacheKey = `${firebaseToken}:${sessionToken}`;

    const cachedAuth = AUTH_RESULT_CACHE.get(authCacheKey);
    if (cachedAuth && Date.now() - cachedAuth.timestamp < AUTH_RESULT_CACHE_TTL) {
      return { user: cachedAuth.user };
    }

    if (cachedAuth) {
      AUTH_RESULT_CACHE.delete(authCacheKey);
    }

    // 1. Verify Firebase JWT (with cache)
    let firebaseUid: string;

    const cachedToken = TOKEN_CACHE.get(firebaseToken);
    if (cachedToken && Date.now() - cachedToken.timestamp < TOKEN_CACHE_TTL) {
      firebaseUid = cachedToken.uid;
    } else {
      try {
        const decodedToken = await getAdminAuth().verifyIdToken(firebaseToken);
        firebaseUid = decodedToken.uid;
        TOKEN_CACHE.set(firebaseToken, { uid: firebaseUid, timestamp: Date.now() });
      } catch (err: any) {
        AUTH_RESULT_CACHE.delete(authCacheKey);
        return {
          error: NextResponse.json(
            { error: "Invalid or expired Firebase token" },
            { status: 401 }
          ),
        };
      }
    }

    // 2. Verify Redis session exists and is valid (with short-lived cache)
    const sessionCacheKey = `${firebaseUid}:${sessionToken}`;
    const cachedSession = SESSION_CACHE.get(sessionCacheKey);
    let isSessionValid = false;

    if (cachedSession && Date.now() - cachedSession.timestamp < SESSION_CACHE_TTL) {
      isSessionValid = cachedSession.valid;
    } else {
      const redisSession = await redis.get<string>(sessionKey(firebaseUid, sessionToken));
      isSessionValid = !!redisSession;
      SESSION_CACHE.set(sessionCacheKey, { valid: isSessionValid, timestamp: Date.now() });
    }

    if (!isSessionValid) {
      AUTH_RESULT_CACHE.delete(authCacheKey);
      return {
        error: NextResponse.json(
          { error: "Session expired or invalidated" },
          { status: 401 }
        ),
      };
    }

    // 3. Get user from database (with in-memory cache)
    const refreshHeader = req.headers.get("x-refresh-user");
    if (refreshHeader === "true") {
      invalidateUserCache(firebaseUid);
    }

    let user = getCachedUser(firebaseUid);

    if (!user) {
      const dbUser = await prisma.user.findUnique({
        where: { firebaseUid },
        select: {
          id: true,
          firebaseUid: true,
          email: true,
          name: true,
          plan: true,
          role: true,
          onboardingComplete: true,
          isLocked: true,
          lockReason: true,
          stripeCustomerId: true,
          maxUnlockedIndex: true,
          timezone: true,
        } as any,
      });

      if (!dbUser) {
        return {
          error: NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          ),
        };
      }

      user = dbUser as unknown as AuthenticatedUser;
      setCachedUser(firebaseUid, user);
    }

    // 4. Check if account is locked
    if (user.isLocked) {
      AUTH_RESULT_CACHE.delete(authCacheKey);
      return {
        error: NextResponse.json(
          {
            error: "Account is locked",
            reason: user.lockReason,
            locked: true,
          },
          { status: 403 }
        ),
      };
    }

    AUTH_RESULT_CACHE.set(authCacheKey, { user, timestamp: Date.now() });

    return { user };
  } catch (error: any) {
    console.error("Auth validation error:", error);
    return {
      error: NextResponse.json(
        { error: "Internal authentication error" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Validates admin access — checks role after standard auth validation.
 */
export async function validateAdminRequest(
  req: NextRequest
): Promise<{ user: AuthenticatedUser } | { error: NextResponse }> {
  const result = await validateRequest(req);

  if ("error" in result) return result;

  if (result.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return result;
}

/**
 * Creates a new session in Redis and database.
 * Enforces the 2-device limit.
 */
export async function createSession(
  userId: string,
  firebaseUid: string,
  sessionToken: string,
  deviceInfo: {
    deviceName: string;
    deviceType: string;
    os: string;
    ipAddress: string;
    locationCity?: string;
    locationCountry?: string;
  }
): Promise<{ invalidatedAll: boolean }> {
  // Get current active sessions for this user
  const existingSessions = await redis.smembers(userSessionsKey(firebaseUid));

  let invalidatedAll = false;

  // If 2+ sessions exist, this is a 3rd device → invalidate ALL
  if (existingSessions.length >= 2) {
    // Invalidate all existing sessions
    for (const oldToken of existingSessions) {
      await redis.del(sessionKey(firebaseUid, oldToken));
    }
    await redis.del(userSessionsKey(firebaseUid));

    // Remove all device sessions from database
    await prisma.deviceSession.deleteMany({
      where: { userId },
    });

    invalidatedAll = true;

    // Track repeated third-device logouts to lock account if abused
    const lockoutKey = `lockout:third_device:${userId}`;
    const currentCount = await redis.incr(lockoutKey);

    // Set expiry for 1 hour on the first offense
    if (currentCount === 1) {
      await redis.expire(lockoutKey, 3600);
    }

    // Lock account if triggered 3 times in an hour
    if (currentCount >= 3) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isLocked: true,
          lockReason: "Repeated third-device login attempts. Account locked pending identity verification.",
        },
      });
      // Delete the tracker
      await redis.del(lockoutKey);
      // Invalidate cache for this user
      invalidateUserCache(firebaseUid);
    }
  }

  // Create new session in Redis (24-hour TTL)
  await redis.set(
    sessionKey(firebaseUid, sessionToken),
    JSON.stringify({ userId, ...deviceInfo, createdAt: new Date().toISOString() }),
    { ex: 86400 } // 24 hours
  );

  // Add token to user's session set
  await redis.sadd(userSessionsKey(firebaseUid), sessionToken);
  await redis.expire(userSessionsKey(firebaseUid), 86400);

  // Create device session record in database
  await prisma.deviceSession.create({
    data: {
      userId,
      sessionToken,
      ...deviceInfo,
    },
  });

  return { invalidatedAll };
}

/**
 * Invalidates a specific session.
 */
export async function invalidateSession(
  firebaseUid: string,
  sessionToken: string
): Promise<void> {
  await redis.del(sessionKey(firebaseUid, sessionToken));
  await redis.srem(userSessionsKey(firebaseUid), sessionToken);

  await prisma.deviceSession.deleteMany({
    where: { sessionToken },
  });
}

/**
 * Invalidates ALL sessions for a user.
 */
export async function invalidateAllSessions(
  userId: string,
  firebaseUid: string
): Promise<number> {
  const existingSessions = await redis.smembers(userSessionsKey(firebaseUid));

  for (const token of existingSessions) {
    await redis.del(sessionKey(firebaseUid, token));
  }
  await redis.del(userSessionsKey(firebaseUid));

  const result = await prisma.deviceSession.deleteMany({
    where: { userId },
  });

  return result.count;
}
