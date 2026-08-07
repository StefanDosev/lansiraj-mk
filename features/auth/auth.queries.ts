import "server-only";

import { redirect } from "next/navigation";

import type { AccessState } from "@/features/auth/auth.types";
import { createClient } from "@/lib/supabase/server";

const unauthenticatedState: AccessState = {
  isAuthenticated: false,
  isReviewer: false,
  hasActiveMembership: false,
  onboardingCompleted: false,
};

export async function getAccessState(): Promise<AccessState> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) return unauthenticatedState;

  const { data, error } = await supabase.rpc("get_access_state");
  if (error || !data?.[0]) throw new Error("Unable to resolve authenticated access state.");

  return {
    isAuthenticated: true,
    isReviewer: data[0].is_reviewer,
    hasActiveMembership: data[0].has_active_membership,
    onboardingCompleted: data[0].onboarding_completed,
  };
}

export async function requireLearnerAccess() {
  const state = await getAccessState();
  if (!state.isAuthenticated) redirect("/auth/sign-in");
  if (!state.hasActiveMembership) redirect(state.isReviewer ? "/admin" : "/access-pending");
  return state;
}

export async function requireReviewerAccess() {
  const state = await getAccessState();
  if (!state.isAuthenticated) redirect("/auth/sign-in");
  if (!state.isReviewer) redirect(state.hasActiveMembership ? "/app" : "/access-pending");
  return state;
}
