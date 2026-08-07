import type { AccessState } from "@/features/auth/auth.types";

export function getAccessDestination(state: AccessState) {
  if (!state.isAuthenticated) return "/auth/sign-in";
  if (state.isReviewer) return "/admin";
  if (!state.hasActiveMembership) return "/access-pending";
  if (!state.onboardingCompleted) return "/app/onboarding";
  return "/app";
}
