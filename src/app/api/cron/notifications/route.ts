import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // In production, verify this is called by a secure cron secret
  // const authHeader = req.headers.get("authorization");
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return ...

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        currentStreak: true,
      }
    });

    // Since preferences are in SystemSetting, we might need a better way to fetch them at scale.
    // For now, we'll fetch them individually or use a raw query if needed.
    
    let processedCount = 0;
    const now = new Date();
    const isSunday = now.getDay() === 0;

    for (const user of users) {
      // Get preferences from SystemSetting
      const preferenceKey = `user:${user.id}:preferences`;
      const prefRecord = await prisma.systemSetting.findUnique({
        where: { key: preferenceKey }
      });

      const prefs = prefRecord?.value ? JSON.parse(prefRecord.value) : {
        streakReminders: true,
        weeklyDigest: false,
      };

      // 1. Streak Reminders
      if (prefs.streakReminders) {
        const learnedToday = await prisma.wordProgress.findFirst({
          where: {
            userId: user.id,
            completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        });

        if (!learnedToday) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: "STREAK_REMINDER",
              title: "Don't break your streak!",
              message: `You have a ${user.currentStreak}-day streak. Keep it going!`,
            }
          });
        }
      }

      // 2. Weekly Digest (Simplified)
      if (prefs.weeklyDigest && isSunday) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: "WEEKLY_DIGEST",
            title: "Your Weekly Mastery Report",
            message: "Check out how many words you've mastered this week!",
          }
        });
      }

      processedCount++;
    }

    return NextResponse.json({ success: true, processedCount });
  } catch (error) {
    console.error("Notification process error:", error);
    return NextResponse.json({ error: "Failed to process notifications" }, { status: 500 });
  }
}
