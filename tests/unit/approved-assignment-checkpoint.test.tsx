import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  deriveApprovedAssignmentNextStep,
  type ApprovedAssignmentNextStep,
} from "@/features/curriculum/approval";
import type {
  CurriculumAssignment,
  CurriculumAssignmentSummary,
} from "@/features/curriculum/curriculum.types";
import { ApprovedAssignmentCheckpoint } from "@/features/reviews/components/approved-assignment-checkpoint";
import type { LearnerReviewFeedback } from "@/features/reviews/review-feedback.types";

function assignment(
  position: number,
  state: CurriculumAssignmentSummary["state"],
): CurriculumAssignmentSummary {
  return {
    position,
    slug: `assignment-${position}`,
    title: `Задача ${position}`,
    state,
  };
}

const approvedAssignment: CurriculumAssignment = {
  ...assignment(1, "approved"),
  projectAssignmentId: "81000000-0000-4000-8000-000000000001",
  curriculumVersion: "v1",
  bodyMarkdown: "Насоки",
  proofPromptMarkdown: "Доказ",
  requiresReview: true,
  stage: {
    position: 1,
    slug: "research",
    title: "Истражи",
    summaryMarkdown: "Резиме",
  },
  acceptanceCriteria: [],
};

const review: LearnerReviewFeedback = {
  id: "82000000-0000-4000-8000-000000000001",
  submissionId: "83000000-0000-4000-8000-000000000001",
  version: 2,
  decision: "approved",
  summary: "Доказот е конкретен и ги исполнува сите критериуми.",
  priorityCorrection: null,
  createdAt: "2026-08-22T10:00:00Z",
  criteria: [
    {
      criterionId: "84000000-0000-4000-8000-000000000001",
      position: 1,
      criterion: "Именуван е конкретен корисник.",
      outcome: "pass",
      note: "Корисникот е прецизно опишан.",
    },
  ],
};

describe("approved assignment checkpoint", () => {
  it("derives the exact next ordered assignment without depending on input order", () => {
    expect(
      deriveApprovedAssignmentNextStep(approvedAssignment, [
        assignment(3, "locked"),
        assignment(1, "approved"),
        assignment(2, "available"),
      ]),
    ).toEqual({ kind: "next", assignment: assignment(2, "available") });
  });

  it("surfaces a locked next projection instead of claiming it was unlocked", () => {
    expect(
      deriveApprovedAssignmentNextStep(approvedAssignment, [
        assignment(1, "approved"),
        assignment(2, "locked"),
      ]),
    ).toEqual({ kind: "locked", assignment: assignment(2, "locked") });
  });

  it("derives terminal completion when no later assignment exists", () => {
    const terminal = { ...approvedAssignment, position: 10, slug: "assignment-10" };
    expect(
      deriveApprovedAssignmentNextStep(terminal, [assignment(10, "approved")]),
    ).toEqual({ kind: "complete" });
  });

  it("renders the approved review, criterion note, and direct next action", () => {
    const nextStep: ApprovedAssignmentNextStep = {
      kind: "next",
      assignment: assignment(2, "available"),
    };
    const html = renderToStaticMarkup(
      <ApprovedAssignmentCheckpoint review={review} nextStep={nextStep} />,
    );

    expect(html).toContain("Одобрено — доказот е доволен");
    expect(html).toContain("Човечки преглед · Верзија 2");
    expect(html).toContain(review.summary);
    expect(html).toContain("Именуван е конкретен корисник.");
    expect(html).toContain("Корисникот е прецизно опишан.");
    expect(html).toContain("Исполнето");
    expect(html).toContain('href="/app/assignments/assignment-2"');
    expect(html).toContain("Продолжи кон Задача 02");
  });

  it("links terminal approval to the completed project", () => {
    const html = renderToStaticMarkup(
      <ApprovedAssignmentCheckpoint review={review} nextStep={{ kind: "complete" }} />,
    );

    expect(html).toContain('href="/app/project"');
    expect(html).toContain("Види го завршениот проект");
  });
});
