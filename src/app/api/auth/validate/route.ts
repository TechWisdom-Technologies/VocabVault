import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth";

/**
 * POST /api/auth/validate
 * Validates session on every authenticated request.
 * Checks BOTH Firebase JWT AND Redis session record.
 */
export async function POST(req: NextRequest) {
  const result = await validateRequest(req);

  if ("error" in result) {
    return result.error;
  }

  return NextResponse.json({
    valid: true,
    user: result.user,
  });
}
