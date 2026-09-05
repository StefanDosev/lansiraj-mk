import { describe, expect, it } from "vitest";

import { deriveProjectJourney } from "@/features/journey/journey";
import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";

function assignment(
  position: number,
  state: ProjectAssignmentSummary["state"],
  stagePosition = Math.ceil(position / 2),
  slug = `assignment-${position}`,
): ProjectAssignmentSummary {
  return {
    projectAssignmentId: `94000000-0000-4000-8000-${String(position).padStart(12, "0")}`,
    state,
    availableAt: null,
    assignment: {
      position,
      slug,
      title: `Задача ${position}`,
      proofPromptMarkdown: `Доказ ${position}`,
      stage: { position: stagePosition, title: `Фаза ${stagePosition}` },
    },
  };
}

describe("deriveProjectJourney", () => {
  it("groups tasks by stage and names the stage with the earliest unresolved task as current", () => {
    const journey = deriveProjectJourney([
      assignment(1, "approved", 1),
      assignment(2, "submitted", 1),
      assignment(3, "locked", 2),
    ], null);

    expect(journey.stages).toHaveLength(2);
    expect(journey.stages[0]).toMatchObject({ isCurrent: true, state: "submitted" });
    expect(journey.stages[1]).toMatchObject({ isCurrent: false, state: "locked" });
    expect(journey.approvedCount).toBe(1);
  });

  it("normalizes every task after the earliest unresolved task to locked", () => {
    const journey = deriveProjectJourney([
      assignment(1, "revision_required"),
      assignment(2, "approved"),
      assignment(3, "available"),
    ], null);

    expect(journey.stages.flatMap((stage) => stage.tasks).map((task) => task.state)).toEqual([
      "revision_required", "locked", "locked",
    ]);
  });

  it("keeps all assignment destinations available while explaining locked prerequisites", () => {
    const journey = deriveProjectJourney([assignment(1, "available"), assignment(2, "locked")], null);
    const locked = journey.stages.flatMap((stage) => stage.tasks)[1];
    expect(locked.slug).toBe("assignment-2");
    expect(locked.unlockCondition).toContain("Задача 1");
  });

  it("reveals the live endpoint only after launch evidence is approved", () => {
    const tasks = [
      assignment(8, "approved", 5),
      assignment(9, "approved", 6, "public-launch-outreach"),
      assignment(10, "available", 6),
    ];
    expect(deriveProjectJourney(tasks, "https://example.com").endpoint).toEqual({
      kind: "live", url: "https://example.com",
    });
  });

  it("reports missing project data after launch approval instead of claiming completion", () => {
    const tasks = [assignment(9, "approved", 6, "public-launch-outreach")];
    expect(deriveProjectJourney(tasks, null).endpoint.kind).toBe("missing_url");
  });

  it("keeps the endpoint locked when an earlier unresolved task makes launch inconsistent", () => {
    const tasks = [
      assignment(8, "available", 5),
      assignment(9, "approved", 6, "public-launch-outreach"),
    ];
    expect(deriveProjectJourney(tasks, "https://example.com").endpoint.kind).toBe("locked");
  });
});
