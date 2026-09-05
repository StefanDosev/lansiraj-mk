import type {
  ReviewCriterionOutcome,
  ReviewDecision,
  ReviewerAssignmentState,
  ReviewerCohortStatus,
  ReviewerProjectStatus,
} from "@/features/reviews/reviews.types";

const reviewerCohortStatuses = new Set<ReviewerCohortStatus>(["draft", "active", "completed"]);
const reviewerProjectStatuses = new Set<ReviewerProjectStatus>(["draft", "active", "completed"]);
const reviewerAssignmentStates = new Set<ReviewerAssignmentState>([
  "locked",
  "available",
  "submitted",
  "revision_required",
  "approved",
]);
const reviewDecisions = new Set<ReviewDecision>(["approved", "revision_required"]);
const reviewCriterionOutcomes = new Set<ReviewCriterionOutcome>(["pass", "revise"]);

export function isReviewerCohortStatus(value: string): value is ReviewerCohortStatus {
  return reviewerCohortStatuses.has(value as ReviewerCohortStatus);
}

export function isReviewerProjectStatus(value: string): value is ReviewerProjectStatus {
  return reviewerProjectStatuses.has(value as ReviewerProjectStatus);
}

export function isReviewerAssignmentState(value: string): value is ReviewerAssignmentState {
  return reviewerAssignmentStates.has(value as ReviewerAssignmentState);
}

export function isReviewDecision(value: string): value is ReviewDecision {
  return reviewDecisions.has(value as ReviewDecision);
}

export function isReviewCriterionOutcome(value: string): value is ReviewCriterionOutcome {
  return reviewCriterionOutcomes.has(value as ReviewCriterionOutcome);
}
