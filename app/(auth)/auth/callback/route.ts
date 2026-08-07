import { NextResponse } from "next/server";

import { getAccessDestination } from "@/features/auth/auth-routing";
import { getAppOrigin } from "@/features/auth/auth-url";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const origin = getAppOrigin();
  const code = new URL(request.url).searchParams.get("code");

  if (!code) return NextResponse.redirect(`${origin}/auth/sign-in?status=callback-error`);

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return NextResponse.redirect(`${origin}/auth/sign-in?status=callback-error`);

  const { error: acceptanceError } = await supabase.rpc("accept_cohort_invite");
  if (acceptanceError) {
    console.error("auth_invite_acceptance_failed", { code: acceptanceError.code });
    return NextResponse.redirect(`${origin}/access-pending`);
  }

  const { data, error: accessError } = await supabase.rpc("get_access_state");
  if (accessError || !data?.[0]) {
    console.error("auth_access_state_failed", { code: accessError?.code });
    return NextResponse.redirect(`${origin}/access-pending`);
  }

  const destination = getAccessDestination({
    isAuthenticated: true,
    isReviewer: data[0].is_reviewer,
    hasActiveMembership: data[0].has_active_membership,
    onboardingCompleted: data[0].onboarding_completed,
  });

  return NextResponse.redirect(`${origin}${destination}`);
}
