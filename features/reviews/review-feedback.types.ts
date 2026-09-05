export const reviewDecisions = ["approved", "revision_required"] as const;
export type ReviewDecision = (typeof reviewDecisions)[number];

export const reviewCriterionOutcomes = ["pass", "revise"] as const;
export type ReviewCriterionOutcome = (typeof reviewCriterionOutcomes)[number];

export type LearnerReviewFeedback = {
  id: string;
  submissionId: string;
  version: number;
  decision: ReviewDecision;
  summary: string;
  priorityCorrection: string | null;
  createdAt: string;
  criteria: Array<{
    criterionId: string;
    position: number;
    criterion: string;
    outcome: ReviewCriterionOutcome;
    note: string | null;
  }>;
};
