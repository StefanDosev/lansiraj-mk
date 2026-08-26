import { describe, expect, it } from "vitest";

import {
  buildReviewerWorkspace,
  formatWaitingDuration,
} from "@/features/reviews/reviews.presentation";
import type { ReviewerWorkspaceSource } from "@/features/reviews/reviews.types";

const source: ReviewerWorkspaceSource = {
  cohorts: [
    { id: "cohort-draft", name: "Идна кохорта", status: "draft", startsAt: null, endsAt: null },
    { id: "cohort-active", name: "Beta 01", status: "active", startsAt: null, endsAt: null },
  ],
  members: [
    { cohortId: "cohort-active", userId: "learner-b", joinedAt: "2026-08-02T10:00:00Z" },
    { cohortId: "cohort-active", userId: "learner-a", joinedAt: "2026-08-01T10:00:00Z" },
  ],
  profiles: [
    { userId: "learner-a", displayName: "Ана", onboardingCompletedAt: "2026-08-01T10:00:00Z" },
    { userId: "learner-b", displayName: "Борис", onboardingCompletedAt: null },
  ],
  projects: [
    {
      id: "project-a",
      ownerId: "learner-a",
      cohortId: "cohort-active",
      title: "Планер",
      status: "active",
      updatedAt: "2026-08-10T10:00:00Z",
      assignments: [
        { state: "submitted", position: 2, title: "Задача 2", stagePosition: 1, stageTitle: "Истражи" },
        { state: "approved", position: 1, title: "Задача 1", stagePosition: 1, stageTitle: "Истражи" },
      ],
    },
  ],
  pendingSubmissions: [
    {
      id: "submission-b",
      version: 1,
      submittedAt: "2026-08-19T08:00:00Z",
      learnerId: "learner-a",
      projectId: "project-a",
      projectTitle: "Планер",
      cohortId: "cohort-active",
      cohortName: "Beta 01",
      assignmentPosition: 2,
      assignmentTitle: "Задача 2",
      stagePosition: 1,
      stageTitle: "Истражи",
    },
    {
      id: "submission-a",
      version: 1,
      submittedAt: "2026-08-18T08:00:00Z",
      learnerId: "learner-a",
      projectId: "project-a",
      projectTitle: "Планер",
      cohortId: "cohort-active",
      cohortName: "Beta 01",
      assignmentPosition: 2,
      assignmentTitle: "Задача 2",
      stagePosition: 1,
      stageTitle: "Истражи",
    },
  ],
};

describe("reviewer workspace presentation", () => {
  it("orders the global queue oldest first and keeps active cohorts first", () => {
    const workspace = buildReviewerWorkspace(source);

    expect(workspace.queue.map((record) => record.id)).toEqual(["submission-a", "submission-b"]);
    expect(workspace.queue[0]).toMatchObject({ learnerName: "Ана", cohortName: "Beta 01" });
    expect(workspace.cohorts.map((cohort) => cohort.id)).toEqual(["cohort-active", "cohort-draft"]);
  });

  it("derives cohort counts and learner progress from protected state", () => {
    const activeCohort = buildReviewerWorkspace(source).cohorts[0];

    expect(activeCohort).toMatchObject({
      activeLearnerCount: 2,
      activeProjectCount: 1,
      pendingReviewCount: 2,
    });
    expect(activeCohort.learners.map((learner) => learner.displayName)).toEqual(["Ана", "Борис"]);
    expect(activeCohort.learners[0]).toMatchObject({
      journeyState: "in_progress",
      approvedCount: 1,
      assignmentCount: 2,
      hasPendingReview: true,
      currentAssignment: { position: 2, state: "submitted" },
    });
    expect(activeCohort.learners[1]).toMatchObject({
      journeyState: "onboarding",
      project: null,
      approvedCount: 0,
    });
  });

  it("excludes submissions whose learner is no longer an active cohort member", () => {
    const workspace = buildReviewerWorkspace({
      ...source,
      members: source.members.filter((member) => member.userId !== "learner-a"),
    });

    expect(workspace.queue).toEqual([]);
    expect(workspace.cohorts[0]).toMatchObject({ pendingReviewCount: 0 });
  });

  it("formats waiting duration without persisting a second clock", () => {
    const now = new Date("2026-08-19T12:00:00Z");
    expect(formatWaitingDuration("2026-08-19T11:59:45Z", now)).toBe("помалку од 1 мин.");
    expect(formatWaitingDuration("2026-08-19T11:42:00Z", now)).toBe("18 мин.");
    expect(formatWaitingDuration("2026-08-19T08:00:00Z", now)).toBe("4 ч.");
    expect(formatWaitingDuration("2026-08-17T08:00:00Z", now)).toBe("2 дена");
  });
});
