import { NextResponse, type NextRequest } from "next/server";

import { completeAuthenticatedAccess } from "@/features/auth/auth-completion.server";
import { getAppOrigin } from "@/features/auth/auth-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const origin = getAppOrigin();
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  const supabase = await createClient();
  const verificationError = code
    ? (await supabase.auth.exchangeCodeForSession(code)).error
    : tokenHash && type === "email"
      ? (await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" })).error
      : new Error("Missing supported email verification parameters");

  if (verificationError) {
    return NextResponse.redirect(`${origin}/auth/sign-in?status=callback-error`);
  }

  const destination = await completeAuthenticatedAccess(supabase);
  return NextResponse.redirect(`${origin}${destination}`);
}
