import { describe, expect, it } from "vitest";

import { reviewSubmissionSchema } from "@/features/reviews/reviews.schema";

const submissionId = "71000000-0000-4000-8000-000000000001";
const firstCriterionId = "73000000-0000-4000-8000-000000000001";
const secondCriterionId = "73000000-0000-4000-8000-000000000002";

const validApproval = {
  submissionId,
  decision: "approved",
  summary: "Доказот ги исполнува двата критериуми.",
  priorityCorrection: "",
  confirmation: "confirmed",
  criteria: [
    { criterionId: firstCriterionId, outcome: "pass", note: "" },
    { criterionId: secondCriterionId, outcome: "pass", note: "Јасен доказ." },
  ],
};

describe("review submission schema", () => {
  it("accepts an approval only when every criterion passes", () => {
    expect(reviewSubmissionSchema.safeParse(validApproval).success).toBe(true);
  });

  it("accepts revision feedback with a criterion note and priority correction", () => {
    const result = reviewSubmissionSchema.safeParse({
      ...validApproval,
      decision: "revision_required",
      priorityCorrection: "Поврзи го заклучокот со белешките од интервјуата.",
      criteria: [
        validApproval.criteria[0],
        { criterionId: secondCriterionId, outcome: "revise", note: "Недостига врска со интервјуата." },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects approval when one criterion needs revision", () => {
    const result = reviewSubmissionSchema.safeParse({
      ...validApproval,
      criteria: [
        validApproval.criteria[0],
        { criterionId: secondCriterionId, outcome: "revise", note: "Потребен е извор." },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "decision")).toBe(true);
  });

  it("requires a note and priority correction for revision", () => {
    const result = reviewSubmissionSchema.safeParse({
      ...validApproval,
      decision: "revision_required",
      criteria: [
        validApproval.criteria[0],
        { criterionId: secondCriterionId, outcome: "revise", note: "" },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join(".") === "criteria.1.note")).toBe(true);
      expect(result.error.issues.some((issue) => issue.path[0] === "priorityCorrection")).toBe(true);
    }
  });

  it("rejects duplicated criterion identifiers", () => {
    const result = reviewSubmissionSchema.safeParse({
      ...validApproval,
      criteria: [validApproval.criteria[0], validApproval.criteria[0]],
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === "criteria")).toBe(true);
  });
});
