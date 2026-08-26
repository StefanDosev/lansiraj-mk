import type {
  EvidenceLinkType,
  ImmutableSubmissionVersion,
  SubmissionStatus,
} from "@/features/submissions/submissions.types";
import type {
  ReviewCriterionOutcome,
  ReviewDecision,
} from "@/features/reviews/review-feedback.types";

export {
  reviewCriterionOutcomes,
  reviewDecisions,
} from "@/features/reviews/review-feedback.types";
export type {
  LearnerReviewFeedback,
  ReviewCriterionOutcome,
  ReviewDecision,
} from "@/features/reviews/review-feedback.types";

export type ReviewerCohortStatus = "draft" | "active" | "completed";
export type ReviewerProjectStatus = "draft" | "active" | "completed";
export type ReviewerAssignmentState =
  | "locked"
  | "available"
  | "submitted"
  | "revision_required"
  | "approved";

export type ReviewerAssignmentSource = {
  state: ReviewerAssignmentState;
  position: number;
  title: string;
  stagePosition: number;
  stageTitle: string;
};

export type ReviewerProjectSource = {
  id: string;
  ownerId: string;
  cohortId: string;
  title: string;
  status: ReviewerProjectStatus;
  updatedAt: string;
  assignments: ReviewerAssignmentSource[];
};

export type ReviewerPendingSubmissionSource = {
  id: string;
  version: number;
  submittedAt: string;
  learnerId: string;
  projectId: string;
  projectTitle: string;
  cohortId: string;
  cohortName: string;
  assignmentPosition: number;
  assignmentTitle: string;
  stagePosition: number;
  stageTitle: string;
};

export type ReviewerWorkspaceSource = {
  cohorts: Array<{
    id: string;
    name: string;
    status: ReviewerCohortStatus;
    startsAt: string | null;
    endsAt: string | null;
  }>;
  members: Array<{
    cohortId: string;
    userId: string;
    joinedAt: string;
  }>;
  profiles: Array<{
    userId: string;
    displayName: string | null;
    onboardingCompletedAt: string | null;
  }>;
  projects: ReviewerProjectSource[];
  pendingSubmissions: ReviewerPendingSubmissionSource[];
};

export type ReviewerQueueRecord = ReviewerPendingSubmissionSource & {
  learnerName: string;
};

export type ReviewerLearnerJourneyState =
  | "onboarding"
  | "project_not_started"
  | "in_progress"
  | "complete";

export type ReviewerLearnerProgress = {
  userId: string;
  displayName: string;
  journeyState: ReviewerLearnerJourneyState;
  project: {
    id: string;
    title: string;
    status: ReviewerProjectStatus;
  } | null;
  approvedCount: number;
  assignmentCount: number;
  currentAssignment: ReviewerAssignmentSource | null;
  hasPendingReview: boolean;
};

export type ReviewerCohortSnapshot = {
  id: string;
  name: string;
  status: ReviewerCohortStatus;
  startsAt: string | null;
  endsAt: string | null;
  activeLearnerCount: number;
  activeProjectCount: number;
  pendingReviewCount: number;
  learners: ReviewerLearnerProgress[];
};

export type ReviewerWorkspace = {
  queue: ReviewerQueueRecord[];
  cohorts: ReviewerCohortSnapshot[];
};

export type ReviewerSubmissionDetail = {
  id: string;
  projectAssignmentId: string;
  version: number;
  evidenceText: string;
  status: SubmissionStatus;
  reviewable: boolean;
  submittedAt: string;
  reviewedAt: string | null;
  learnerId: string;
  learnerName: string;
  projectId: string;
  projectTitle: string;
  cohortId: string;
  cohortName: string;
  assignmentPosition: number;
  assignmentTitle: string;
  stagePosition: number;
  stageTitle: string;
  criteria: ReviewerAcceptanceCriterion[];
  history: ImmutableSubmissionVersion[];
  review: ReviewerCompletedReview | null;
  links: Array<{
    id: string;
    type: EvidenceLinkType;
    label: string;
    url: string;
    position: number;
  }>;
};

export type ReviewerAcceptanceCriterion = {
  id: string;
  position: number;
  criterion: string;
};

export type ReviewerCompletedReview = {
  id: string;
  decision: ReviewDecision;
  summary: string;
  priorityCorrection: string | null;
  createdAt: string;
  criteria: Array<{
    criterionId: string;
    outcome: ReviewCriterionOutcome;
    note: string | null;
  }>;
};

export type ReviewCriterionValues = {
  criterionId: string;
  outcome: ReviewCriterionOutcome | "";
  note: string;
};

export type ReviewSubmissionValues = {
  submissionId: string;
  decision: ReviewDecision | "";
  summary: string;
  priorityCorrection: string;
  confirmation: string;
  criteria: ReviewCriterionValues[];
};

export type ReviewSubmissionFieldErrors = {
  decision?: string[];
  summary?: string[];
  priorityCorrection?: string[];
  confirmation?: string[];
  criteria?: Array<{
    outcome?: string[];
    note?: string[];
  }>;
};

export type ReviewSubmissionState =
  | { status: "idle"; values: ReviewSubmissionValues }
  | {
      status: "error";
      values: ReviewSubmissionValues;
      message: string;
      fieldErrors?: ReviewSubmissionFieldErrors;
      conflict?: boolean;
    };
