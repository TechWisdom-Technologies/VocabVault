import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";

/**
 * POST /api/cron/streak-reminder
 * Sends daily streak reminder emails to users who haven't started today's words.
 * Intended to be called by a cron job (e.g. Vercel Cron or external scheduler).
 * Protected by CRON_SECRET environment variable.
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find users with an active streak (streak > 0) who do NOT have a DailyWordSet for today
    const usersWithStreaks = await prisma.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        isLocked: false,
        onboardingComplete: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentStreak: true,
        longestStreak: true,
        dailyWordSets: {
          where: { date: today },
          select: { id: true },
        },
      },
    });

    // Filter to only users who haven't started today
    const usersToNotify = usersWithStreaks.filter(
      (u) => u.dailyWordSets.length === 0
    );

    let sentCount = 0;
    const errors: string[] = [];

    for (const user of usersToNotify) {
      try {
        await resend.emails.send({
          from: `VocabVault <${FROM_EMAIL}>`,
          to: user.email,
          subject: `🔥 Don't break your ${user.currentStreak}-day streak!`,
          html: `
            <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h1 style="font-size: 24px; margin-bottom: 8px;">Hey ${user.name || "Learner"} 👋</h1>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
                You're on a <strong style="color: #7c3aed;">${user.currentStreak}-day streak</strong>! 
                Don't let it slip — log in today to keep it going.
              </p>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Your longest streak: <strong>${user.longestStreak} days</strong>
              </p>
              <div style="margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: white; padding: 12px 32px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 16px;">
                  Continue Learning →
                </a>
              </div>
              <p style="color: #9ca3af; font-size: 12px;">
                — The VocabVault Team
              </p>
            </div>
          `,
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send streak reminder to ${user.email}:`, e);
        errors.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      totalEligible: usersToNotify.length,
      sent: sentCount,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Streak reminder cron error:", error);
    return NextResponse.json(
      { error: "Failed to process streak reminders" },
      { status: 500 }
    );
  }
}
