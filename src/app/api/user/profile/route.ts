import { NextRequest, NextResponse } from "next/server";
import { validateRequest, invalidateUserCache } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PREFERENCES = {
  streakReminders: true,
  weeklyDigest: false,
  productUpdates: true,
  securityAlerts: true,
  emailNewsletter: false,
};

function preferenceKey(userId: string): string {
  return `user:${userId}:preferences`;
}

interface CachedProfileResponse {
  data: any;
  timestamp: number;
}

const PROFILE_RESPONSE_CACHE = new Map<string, CachedProfileResponse>();
const PROFILE_RESPONSE_CACHE_TTL = 30_000;

export async function GET(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;

    const cached = PROFILE_RESPONSE_CACHE.get(user.id);
    if (cached && Date.now() - cached.timestamp < PROFILE_RESPONSE_CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    if (cached) {
      PROFILE_RESPONSE_CACHE.delete(user.id);
    }

    // Single query — get user profile data only
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        role: true,
        avatarUrl: true,
        onboardingComplete: true,
        rulesAcknowledged: true,
        totalScore: true,
        wordsLearned: true,
        maxUnlockedIndex: true,
        dayCount: true,
        currentStreak: true,
        longestStreak: true,
        dob: true,
        nationality: true,
        phone: true,
        profession: true,
        reason: true,
        achievements: true,
        streakRewards: true,
        timezone: true,
      } as any,
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fullUser = dbUser as any;

    // --- SELF-HEALING: Sync maxUnlockedIndex with actual progress ---
    const lastCompleted = await prisma.wordProgress.findFirst({
      where: { userId: user.id, status: "COMPLETED" },
      include: { word: true },
      orderBy: { word: { orderIndex: "desc" } }
    });

    if (lastCompleted && lastCompleted.word.orderIndex >= fullUser.maxUnlockedIndex) {
      const newMax = lastCompleted.word.orderIndex + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { maxUnlockedIndex: newMax }
      });
      fullUser.maxUnlockedIndex = newMax;
    }
    // ----------------------------------------------------------------

    const [todayScoreAgg, preferenceRecord, wordsLearnedToday] = await Promise.all([
      prisma.stageScore.aggregate({
        where: {
          wordProgress: {
            userId: user.id,
          },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
        _sum: { score: true },
      }),
      prisma.systemSetting.findUnique({
        where: { key: preferenceKey(user.id) },
      }),
      prisma.wordProgress.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate day average from already-stored values (no extra query)
    const dayAvgScore = fullUser.dayCount > 0 
      ? Math.round(fullUser.totalScore / fullUser.dayCount) 
      : fullUser.totalScore;

    let notificationPreferences = DEFAULT_PREFERENCES;
    if (preferenceRecord?.value) {
      try {
        notificationPreferences = {
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(preferenceRecord.value),
        };
      } catch {
        notificationPreferences = DEFAULT_PREFERENCES;
      }
    }

    // --- SELF-HEALING ACHIEVEMENTS: Virtually unlock if missing ---
    const virtualStreakRewards = [...(fullUser.streakRewards || [])];
    const streakMilestones = [3, 7, 30, 90, 100];
    streakMilestones.forEach(m => {
      if (fullUser.currentStreak >= m && !virtualStreakRewards.some(r => r.milestone === m)) {
        virtualStreakRewards.push({
          id: `virtual-streak-${m}`,
          userId: user.id,
          milestone: m,
          claimedAt: new Date(),
          isVirtual: true
        } as any);
      }
    });

    const virtualAchievements = [...(fullUser.achievements || [])];
    if (fullUser.wordsLearned >= 10 && !virtualAchievements.some(a => a.type === "FIRST_TEN_WORDS")) {
      virtualAchievements.push({ 
        id: "v-1", 
        userId: user.id,
        type: "FIRST_TEN_WORDS", 
        unlockedAt: new Date(),
        metadata: {}
      });
    }
    if (dayAvgScore >= 90 && fullUser.wordsLearned >= 5 && !virtualAchievements.some(a => a.type === "MASTERY_ELITE")) {
      virtualAchievements.push({ 
        id: "v-2", 
        userId: user.id,
        type: "MASTERY_ELITE", 
        unlockedAt: new Date(),
        metadata: {}
      });
    }
    // -------------------------------------------------------------

    const responsePayload = {
      ...fullUser,
      achievements: virtualAchievements,
      streakRewards: virtualStreakRewards,
      todayScore: todayScoreAgg._sum.score || 0,
      wordsLearnedToday,
      dayAvgScore,
      notificationPreferences,
    };

    PROFILE_RESPONSE_CACHE.set(user.id, {
      data: responsePayload,
      timestamp: Date.now(),
    });

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { user } = authResult;
    const contentType = req.headers.get("content-type") || "";
    
    let name, phone, nationality, profession, reason, avatarUrl, dob, notificationPreferences, timezone;
    let avatarFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      name = formData.get("name") as string;
      phone = formData.get("phone") as string;
      nationality = formData.get("nationality") as string;
      profession = formData.get("profession") as string;
      reason = formData.get("reason") as string;
      dob = formData.get("dob") as string;
      avatarUrl = formData.get("avatarUrl") as string; // existing URL
      avatarFile = formData.get("avatar") as File | null;
      
      const prefsJson = formData.get("notificationPreferences") as string;
      if (prefsJson) {
        try { notificationPreferences = JSON.parse(prefsJson); } catch {}
      }
    } else {
      const body = await req.json();
      ({ name, phone, nationality, profession, reason, avatarUrl, dob, notificationPreferences, timezone } = body);
    }

    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    // Handle new avatar upload
    if (avatarFile && avatarFile.size > 0) {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const fileExt = avatarFile.name.split(".").pop() || "jpg";
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;
        const buffer = Buffer.from(await avatarFile.arrayBuffer());

        const { error: uploadError } = await supabaseAdmin.storage
          .from("avatars")
          .upload(fileName, buffer, {
            contentType: avatarFile.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from("avatars")
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        name: name.trim(),
        phone: phone?.trim(),
        nationality: nationality?.trim(),
        profession: profession?.trim(),
        reason: reason?.trim(),
        dob: dob ? new Date(dob) : null,
        timezone: timezone || undefined,
        ...(avatarUrl !== undefined && { avatarUrl })
      } as any,
    });

    if (notificationPreferences) {
      await prisma.systemSetting.upsert({
        where: { key: preferenceKey(user.id) },
        update: {
          value: JSON.stringify(notificationPreferences),
          updatedBy: user.id,
        },
        create: {
          key: preferenceKey(user.id),
          value: JSON.stringify(notificationPreferences),
          updatedBy: user.id,
        },
      });
    }

    // Invalidate the auth cache so the new name/avatar shows up immediately
    invalidateUserCache(user.firebaseUid);
    PROFILE_RESPONSE_CACHE.delete(user.id);

    return NextResponse.json({ success: true, name: updatedUser.name, avatarUrl: updatedUser.avatarUrl });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
