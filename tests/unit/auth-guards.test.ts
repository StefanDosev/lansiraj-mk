import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AccessState } from "@/features/auth/auth.types";

const { createClientMock, redirectMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`redirect:${destination}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient: createClientMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("server-only", () => ({}));

import {
  requireCompletedLearnerAccess,
  requireLearnerAccess,
  requireLearnerOnboardingAccess,
} from "@/features/auth/auth.queries";

function useAccessState(state: AccessState) {
  createClientMock.mockResolvedValue({
    auth: {
      getClaims: vi.fn().mockResolvedValue(
        state.isAuthenticated
          ? { data: { claims: { sub: "learner-id" } }, error: null }
          : { data: null, error: null },
      ),
    },
    rpc: vi.fn().mockResolvedValue({
      data: state.isAuthenticated
        ? [
            {
              is_reviewer: state.isReviewer,
              has_active_membership: state.hasActiveMembership,
              onboarding_completed: state.onboardingCompleted,
            },
          ]
        : null,
      error: null,
    }),
  });
}

describe("learner access guards", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    redirectMock.mockClear();
  });

  it("sends reviewers to the reviewer workspace even when they are cohort members", async () => {
    useAccessState({
      isAuthenticated: true,
      isReviewer: true,
      hasActiveMembership: true,
      onboardingCompleted: true,
    });

    await expect(requireLearnerAccess()).rejects.toThrow("redirect:/admin");
  });

  it("keeps incomplete learners inside onboarding", async () => {
    useAccessState({
      isAuthenticated: true,
      isReviewer: false,
      hasActiveMembership: true,
      onboardingCompleted: false,
    });

    await expect(requireCompletedLearnerAccess()).rejects.toThrow("redirect:/app/onboarding");
  });

  it("allows completed learners into post-onboarding routes", async () => {
    const state = {
      isAuthenticated: true,
      isReviewer: false,
      hasActiveMembership: true,
      onboardingCompleted: true,
    } satisfies AccessState;
    useAccessState(state);

    await expect(requireCompletedLearnerAccess()).resolves.toEqual(state);
  });

  it("sends completed learners away from onboarding", async () => {
    useAccessState({
      isAuthenticated: true,
      isReviewer: false,
      hasActiveMembership: true,
      onboardingCompleted: true,
    });

    await expect(requireLearnerOnboardingAccess()).rejects.toThrow("redirect:/app");
  });
});
