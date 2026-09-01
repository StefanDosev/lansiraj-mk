import { beforeEach, describe, expect, it, vi } from "vitest";

const { createClientMock, requireReviewerAccessMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  requireReviewerAccessMock: vi.fn(),
}));

vi.mock("@/features/auth/auth.queries", () => ({
  requireReviewerAccess: requireReviewerAccessMock,
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: createClientMock }));
vi.mock("server-only", () => ({}));

import { getProjectForReview } from "@/features/projects/projects.queries";
import {
  getReviewerWorkspace,
  getSubmissionForReview,
} from "@/features/reviews/reviews.queries";

describe("reviewer data access", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    requireReviewerAccessMock.mockReset();
  });

  it.each([
    ["workspace", () => getReviewerWorkspace()],
    ["project", () => getProjectForReview("project-id")],
    ["submission", () => getSubmissionForReview("submission-id")],
  ])("blocks the %s query before opening a Supabase client", async (_name, query) => {
    requireReviewerAccessMock.mockRejectedValueOnce(new Error("redirect:/auth/sign-in"));

    await expect(query()).rejects.toThrow("redirect:/auth/sign-in");
    expect(requireReviewerAccessMock).toHaveBeenCalledOnce();
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
