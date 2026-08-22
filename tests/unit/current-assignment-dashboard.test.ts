import { describe, expect, it } from "vitest";

import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";
import { deriveCurrentAssignmentDashboard } from "@/features/progress/dashboard";

function assignment(position: number, state: ProjectAssignmentSummary["state"]): ProjectAssignmentSummary {
  return {
    projectAssignmentId: `94000000-0000-4000-8000-${String(position).padStart(12, "0")}`,
    state,
    availableAt: state === "available" ? "2026-08-12T12:00:00Z" : null,
    assignment: {
      position,
      slug: `assignment-${position}`,
      title: `Задача ${position}`,
      proofPromptMarkdown: `Доказ ${position}`,
      stage: { position: Math.ceil(position / 2), title: `Фаза ${Math.ceil(position / 2)}` },
    },
  };
}

describe("deriveCurrentAssignmentDashboard", () => {
  it.each(["available", "submitted", "revision_required"] as const)(
    "presents the earliest unresolved %s assignment",
    (state) => {
      const result = deriveCurrentAssignmentDashboard([
        assignment(3, "available"),
        assignment(1, "approved"),
        assignment(2, state),
      ]);

      expect(result.kind).toBe("current");
      if (result.kind !== "current") return;
      expect(result.assignment.position).toBe(2);
      expect(result.projectAssignmentId).toBe("94000000-0000-4000-8000-000000000002");
      expect(result.state).toBe(state);
      expect(result.progress).toEqual({ approved: 1, total: 3 });
      expect(result.unlockCondition.length).toBeGreaterThan(20);
    },
  );

  it("does not skip an earlier locked assignment for a later available one", () => {
    const result = deriveCurrentAssignmentDashboard([
      assignment(2, "locked"),
      assignment(3, "available"),
      assignment(1, "approved"),
    ]);

    expect(result.kind).toBe("locked");
    if (result.kind === "locked") expect(result.assignment.position).toBe(2);
  });

  it("returns complete only when every assignment is approved", () => {
    expect(deriveCurrentAssignmentDashboard([assignment(1, "approved")])).toMatchObject({
      kind: "complete",
      progress: { approved: 1, total: 1 },
    });
  });

  it("returns an intentional empty state when projections are missing", () => {
    expect(deriveCurrentAssignmentDashboard([])).toEqual({
      kind: "empty",
      progress: { approved: 0, total: 0 },
    });
  });
});
