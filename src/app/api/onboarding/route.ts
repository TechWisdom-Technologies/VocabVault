import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/schemas/onboarding";
import { supabaseAdmin } from "@/lib/supabase/client";
import { resend, FROM_EMAIL } from "@/lib/resend";

/**
 * POST /api/onboarding
 * Save onboarding data. Requires full completion — no partial submission.
 */
export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  try {
    const formData = await req.formData();

    // Extract fields from multipart form data
    const data = {
      name: formData.get("name") as string,
      dob: formData.get("dob") as string,
      age: Number(formData.get("age")),
      nationality: formData.get("nationality") as string,
      phone: formData.get("phone") as string,
      profession: formData.get("profession") as string,
      reason: formData.get("reason") as string,
    };

    // Validate with Zod
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Handle avatar upload
    let avatarUrl: string | null = null;
    const avatarFile = formData.get("avatar") as File | null;

    if (avatarFile && avatarFile.size > 0) {
      const fileExt = avatarFile.name.split(".").pop();
      const fileName = `${authResult.user.id}/avatar.${fileExt}`;
      const buffer = Buffer.from(await avatarFile.arrayBuffer());

      if (!supabaseAdmin) {
        console.error("Supabase admin client is not configured; skipping avatar upload");
      } else {
        const { error: uploadError } = await supabaseAdmin.storage
          .from("avatars")
          .upload(fileName, buffer, {
            contentType: avatarFile.type,
            upsert: true,
          });

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from("avatars")
            .getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }
    }

    // Update user record
    const updateData: any = {
      name: parsed.data.name,
      dob: new Date(parsed.data.dob),
      age: parsed.data.age,
      nationality: parsed.data.nationality,
      phone: parsed.data.phone,
      profession: parsed.data.profession,
      reason: parsed.data.reason,
      onboardingComplete: true,
    };

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }

    const user = await prisma.user.update({
      where: { id: authResult.user.id },
      data: updateData,
    }) as any;

    // Send Welcome Email & Create Notification
    try {
      await Promise.all([
        resend.emails.send({
          from: `VocabVault <${FROM_EMAIL}>`,
          to: user.email,
          subject: "Welcome to VocabVault!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1>Welcome, ${user.name || "Learner"}!</h1>
              <p>We're thrilled to have you on board. VocabVault is your personal path to English mastery.</p>
              <p>Get started with your first daily word set today!</p>
              <br/>
              <p>Happy Learning,</p>
              <p>The VocabVault Team</p>
            </div>
          `,
        }),
        prisma.notification.create({
          data: {
            userId: user.id,
            type: "WELCOME",
            title: "Welcome to VocabVault!",
            message: "We're thrilled to have you here. Complete your first word set to start your streak!",
          }
        })
      ]);
    } catch (e) {
      console.error("Failed to send welcome communications:", e);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        role: user.role,
        onboardingComplete: user.onboardingComplete,
        rulesAcknowledged: user.rulesAcknowledged,
        maxUnlockedIndex: user.maxUnlockedIndex,
        timezone: user.timezone,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
