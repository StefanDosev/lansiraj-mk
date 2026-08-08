import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database.types";

import { getAccessDestination } from "./auth-routing";

export async function completeAuthenticatedAccess(supabase: SupabaseClient<Database>) {
  const { error: acceptanceError } = await supabase.rpc("accept_cohort_invite");
  if (acceptanceError) {
    console.error("auth_invite_acceptance_failed", { code: acceptanceError.code });
    return "/access-pending";
  }

  const { data, error: accessError } = await supabase.rpc("get_access_state");
  if (accessError || !data?.[0]) {
    console.error("auth_access_state_failed", { code: accessError?.code });
    return "/access-pending";
  }

  return getAccessDestination({
    isAuthenticated: true,
    isReviewer: data[0].is_reviewer,
    hasActiveMembership: data[0].has_active_membership,
    onboardingCompleted: data[0].onboarding_completed,
  });
}
