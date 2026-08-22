import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReviewerQueue } from "@/features/reviews/components/reviewer-queue";
import { SubmissionReviewPreview } from "@/features/reviews/components/submission-review-preview";
import type {
  ReviewerQueueRecord,
  ReviewerSubmissionDetail,
} from "@/features/reviews/reviews.types";

const queueRecord: ReviewerQueueRecord = {
  id: "71000000-0000-4000-8000-000000000001",
  version: 1,
  submittedAt: "2026-08-19T08:00:00Z",
  learnerId: "learner-a",
  learnerName: "Ана",
  projectId: "project-a",
  projectTitle: "Мал планер",
  cohortId: "cohort-a",
  cohortName: "Beta 01",
  assignmentPosition: 1,
  assignmentTitle: "Дефинирај корисник",
  stagePosition: 1,
  stageTitle: "Истражи",
};

const submission: ReviewerSubmissionDetail = {
  ...queueRecord,
  projectAssignmentId: "70000000-0000-4000-8000-000000000001",
  evidenceText: "Три разговори со конкретни корисници.",
  status: "submitted",
  reviewedAt: null,
  review: null,
  criteria: [
    {
      id: "73000000-0000-4000-8000-000000000001",
      position: 1,
      criterion: "Доказот содржи разговори со конкретни корисници.",
    },
  ],
  history: [],
  links: [
    {
      id: "72000000-0000-4000-8000-000000000001",
      type: "research",
      label: "Белешки",
      url: "https://example.com/notes",
      position: 1,
    },
  ],
};

describe("reviewer components", () => {
  it("renders one semantic oldest-first queue record with a submission-specific link", () => {
    const html = renderToStaticMarkup(
      <ReviewerQueue records={[queueRecord]} now={new Date("2026-08-19T12:00:00Z")} />,
    );

    expect(html).toContain("<table");
    expect(html).toContain("Ана");
    expect(html).toContain("4 ч.");
    expect(html).toContain('href="/admin/reviews/71000000-0000-4000-8000-000000000001"');
  });

  it("renders an intentional empty queue state", () => {
    const html = renderToStaticMarkup(<ReviewerQueue records={[]} now={new Date()} />);
    expect(html).toContain("Нема докази што чекаат.");
    expect(html).not.toContain("<table");
  });

  it("keeps the immutable evidence and typed links visible on the read-only destination", () => {
    const html = renderToStaticMarkup(<SubmissionReviewPreview submission={submission} />);
    expect(html).toContain("Три разговори со конкретни корисници.");
    expect(html).toContain("Замрзнат доказ · Верзија 1");
    expect(html).toContain('href="https://example.com/notes"');
    expect(html).toContain("Доказот содржи разговори со конкретни корисници.");
    expect(html).toContain("Зачувај конечна одлука");
  });
});
