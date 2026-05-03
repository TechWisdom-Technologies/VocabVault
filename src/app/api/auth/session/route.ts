import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import { createSession, invalidateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSessionSchema } from "@/schemas/auth";
import { generateSessionToken } from "@/lib/utils";

/**
 * POST /api/auth/session
 * Create a new session after Firebase login.
 * Enforces 2-device limit. Third device invalidates all sessions.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { firebaseToken, deviceInfo } = parsed.data;

    // Verify Firebase token
    let decodedToken;
    try {
      decodedToken = await getAdminAuth().verifyIdToken(firebaseToken);
    } catch (err: any) {
      console.error("Firebase ID Token verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid Firebase token", details: err.message },
        { status: 401 }
      );
    }

    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in Firebase token" },
        { status: 400 }
      );
    }

    // Check if email is verified
    if (!decodedToken.email_verified) {
      return NextResponse.json(
        { error: "Email not verified", emailVerified: false },
        { status: 403 }
      );
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      // First-time login — create user record
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isAutoAdmin = adminEmails.includes(email.toLowerCase());

      user = await prisma.user.create({
        data: {
          firebaseUid,
          email,
          role: isAutoAdmin ? "ADMIN" : "USER",
        },
      });
    } else {
      // Also check on existing logins in case they were added to the ENV later
      const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
      const isAutoAdmin = adminEmails.includes(email.toLowerCase());

      if (isAutoAdmin && user.role !== "ADMIN") {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    }

    // Check if account is locked
    if (user.isLocked) {
      return NextResponse.json(
        {
          error: "Account is locked",
          reason: user.lockReason,
          locked: true,
        },
        { status: 403 }
      );
    }

    // Capture real IP from headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = forwarded ? forwarded.split(",")[0] : (req.headers.get("x-real-ip") || "127.0.0.1");
    
    // Capture location from deployment headers (e.g. Vercel)
    const city = req.headers.get("x-vercel-ip-city") || deviceInfo.locationCity;
    const country = req.headers.get("x-vercel-ip-country") || deviceInfo.locationCountry;

    // Ensure deviceInfo has the real IP and location
    const enrichedDeviceInfo = {
      ...deviceInfo,
      ipAddress: realIp,
      locationCity: city || "Unknown",
      locationCountry: country || "Unknown"
    };

    // Generate session token and create session
    const sessionToken = generateSessionToken();
    const { invalidatedAll } = await createSession(
      user.id,
      firebaseUid,
      sessionToken,
      enrichedDeviceInfo
    );

    return NextResponse.json({
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        role: user.role,
        avatarUrl: user.avatarUrl,
        onboardingComplete: user.onboardingComplete,
        rulesAcknowledged: user.rulesAcknowledged,
        maxUnlockedIndex: user.maxUnlockedIndex,
      },
      invalidatedAll,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Invalidate a session on logout.
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionToken, firebaseUid } = body;

    if (!sessionToken || !firebaseUid) {
      return NextResponse.json(
        { error: "Session token and Firebase UID required" },
        { status: 400 }
      );
    }

    await invalidateSession(firebaseUid, sessionToken);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session invalidation error:", error);
    return NextResponse.json(
      { error: "Failed to invalidate session" },
      { status: 500 }
    );
  }
}
