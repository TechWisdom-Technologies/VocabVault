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

    const { transactionId, rejectionReason } = await req.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    if (!rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
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
        { error: "Only PENDING transactions can be rejected" },
        { status: 400 }
      );
    }

    // Update transaction status to REJECTED
    const rejectedTransaction = await prisma.paymentTransaction.update({
      where: { id: transactionId },
      data: {
        status: "REJECTED",
        rejectionReason,
        verifiedBy: adminUser.id,
      },
    });

    // Send rejection email to user
    try {
      if (transaction.user.email) {
        await resend.emails.send({
          from: `VocabVault <${FROM_EMAIL}>`,
          to: transaction.user.email,
          subject: "Payment Verification - Action Required",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #ef4444;">Payment Verification Failed</h1>
              <p style="font-size: 16px; line-height: 1.6;">Dear ${transaction.user.name || "Learner"},</p>
              <p style="font-size: 16px; line-height: 1.6;">Unfortunately, we were unable to verify your payment with the following details:</p>
              <ul>
                <li><strong>Transaction ID:</strong> ${transaction.transactionId}</li>
                <li><strong>Payment Method:</strong> ${transaction.paymentMethod.toUpperCase()}</li>
              </ul>
              <p style="font-size: 16px; line-height: 1.6;"><strong>Reason:</strong> ${rejectionReason}</p>
              <p style="font-size: 16px; line-height: 1.6;">Please verify your transaction details and try again, or contact our support team for assistance.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Try Again</a>
              <br/><br/>
              <p style="font-size: 14px; color: #666;">Need help? Contact us at support@vocabvault.com<br/>The VocabVault Team</p>
            </div>
          `,
        });
      }
    } catch (e) {
      console.error("Failed to send rejection email:", e);
    }

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminUserId: adminUser.id,
        action: "REJECT_PAYMENT",
        targetType: "PAYMENT_TRANSACTION",
        targetId: transactionId,
        reason: rejectionReason,
        details: {
          userId: transaction.userId,
          amount: transaction.amount,
          paymentMethod: transaction.paymentMethod,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Transaction rejected and user notified",
      transaction: rejectedTransaction,
    });
  } catch (error: any) {
    console.error("Reject transaction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
