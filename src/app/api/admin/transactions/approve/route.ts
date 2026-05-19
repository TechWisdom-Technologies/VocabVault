import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@vocabvault.com";

export async function POST(req: NextRequest) {
  const authResult = await validateRequest(req);
  if ("error" in authResult) return authResult.error;

  const { user: adminUser } = authResult;

  try {
    // Check if user is admin
    if (adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { transactionId } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Get the transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only PENDING transactions can be approved" },
        { status: 400 }
      );
    }

    // Update transaction status to VERIFIED
    const verifiedTransaction = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: adminUser.id,
      },
    });

    // Upgrade the user to PRO
    const upgradedUser = await prisma.user.update({
      where: { id: transaction.userId },
      data: {
        plan: "PRO",
      },
    });

    await prisma.notification.create({
      data: {
        userId: upgradedUser.id,
        type: "PAYMENT_APPROVED",
        title: "You are now PRO",
        message: "Your payment has been verified by an admin. PRO access is now active.",
        metadata: {
          transactionId: transaction.id,
          paymentMethod: transaction.paymentMethod,
          amount: transaction.amount,
        },
      },
    });

    // Send PRO upgrade confirmation email
    try {
      if (upgradedUser.email) {
        await resend.emails.send({
          from: `VocabVault <${FROM_EMAIL}>`,
          to: upgradedUser.email,
          subject: "Welcome to VocabVault PRO!",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #7c3aed;">Thank you for upgrading, ${upgradedUser.name || "Learner"}!</h1>
              <p style="font-size: 16px; line-height: 1.6;">Your payment has been verified and your account has been successfully upgraded to <strong>VocabVault PRO</strong>.</p>
              <p style="font-size: 16px; line-height: 1.6;">Transaction ID: <code>${transaction.transactionId}</code></p>
              <p style="font-size: 16px; line-height: 1.6;">You now have unlimited access to:</p>
              <ul>
                <li>All learning stages (1-10)</li>
                <li>Advanced AI evaluations</li>
                <li>Daily vocabulary boosters</li>
                <li>Priority support</li>
              </ul>
              <p style="font-size: 16px; line-height: 1.6;">Get started now by visiting your dashboard.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
              <br/><br/>
              <p style="font-size: 14px; color: #666;">Happy Learning,<br/>The VocabVault Team</p>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("Failed to send PRO upgrade email:", e);
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminUserId: adminUser.id,
        action: "APPROVE_PAYMENT",
        targetType: "PAYMENT_TRANSACTION",
        targetId: transactionId,
        reason: "Admin verified payment transaction",
        details: {
          userId: transaction.userId,
          amount: transaction.amount,
          paymentMethod: transaction.paymentMethod,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction approved and user upgraded to PRO",
      transaction: verifiedTransaction,
    });
  } catch (error: any) {
    console.error("Approve transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
