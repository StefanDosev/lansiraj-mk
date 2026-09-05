import { NextResponse } from "next/server";

import { completeAuthenticatedAccess } from "@/features/auth/auth-completion.server";
import { getAppOrigin } from "@/features/auth/auth-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = getAppOrigin();
  const code = new URL(request.url).searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/auth/sign-in?status=callback-error`);

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return NextResponse.redirect(`${origin}/auth/sign-in?status=callback-error`);

  const destination = await completeAuthenticatedAccess(supabase);
  return NextResponse.redirect(`${origin}${destination}`);
}
