import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ActiveRevisionFeedback } from "@/features/reviews/components/learner-review-feedback";
import type { LearnerReviewFeedback } from "@/features/reviews/review-feedback.types";

const feedback: LearnerReviewFeedback = {
  id: "74000000-0000-4000-8000-000000000001",
  submissionId: "71000000-0000-4000-8000-000000000001",
  version: 1,
  decision: "revision_required",
  summary: "Два критериуми се исполнети, но недостига конкретна алтернатива.",
  priorityCorrection: "Именувај една конкретна сегашна алтернатива.",
  createdAt: "2026-08-20T08:30:00Z",
  criteria: [
    {
      criterionId: "73000000-0000-4000-8000-000000000001",
      position: 1,
      criterion: "Корисникот е специфичен.",
      outcome: "pass",
      note: "Јасно е опишан.",
    },
    {
      criterionId: "73000000-0000-4000-8000-000000000002",
      position: 2,
      criterion: "Наведена е сегашната алтернатива.",
      outcome: "revise",
      note: "Алтернативата недостига.",
    },
  ],
};

describe("learner revision feedback", () => {
  it("prioritizes the correction and shows only revised criteria in the active panel", () => {
    const html = renderToStaticMarkup(<ActiveRevisionFeedback feedback={feedback} />);

    expect(html).toContain("Поправи ја верзија 1");
    expect(html).toContain("Именувај една конкретна сегашна алтернатива.");
    expect(html).toContain("Два критериуми се исполнети");
    expect(html).toContain("Наведена е сегашната алтернатива.");
    expect(html).toContain("Алтернативата недостига.");
    expect(html).not.toContain("Корисникот е специфичен.");
  });

  it("renders an explicit recovery state when revision details are missing", () => {
    const html = renderToStaticMarkup(<ActiveRevisionFeedback feedback={null} />);
    expect(html).toContain("Повратната информација не е достапна");
    expect(html).toContain("Освежи ја страницата");
  });
});
