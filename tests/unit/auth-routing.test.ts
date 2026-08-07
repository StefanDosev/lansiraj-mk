import { describe, expect, it } from "vitest";

import { getAccessDestination } from "@/features/auth/auth-routing";

describe("getAccessDestination", () => {
  it.each([
    [{ isAuthenticated: false, isReviewer: false, hasActiveMembership: false, onboardingCompleted: false }, "/auth/sign-in"],
    [{ isAuthenticated: true, isReviewer: true, hasActiveMembership: false, onboardingCompleted: false }, "/admin"],
    [{ isAuthenticated: true, isReviewer: false, hasActiveMembership: false, onboardingCompleted: false }, "/access-pending"],
    [{ isAuthenticated: true, isReviewer: false, hasActiveMembership: true, onboardingCompleted: false }, "/app/onboarding"],
    [{ isAuthenticated: true, isReviewer: false, hasActiveMembership: true, onboardingCompleted: true }, "/app"],
  ] as const)("routes access state to %s", (state, destination) => {
    expect(getAccessDestination(state)).toBe(destination);
  });
});
