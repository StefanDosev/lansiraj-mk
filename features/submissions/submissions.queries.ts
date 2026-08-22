import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  isEvidenceLinkType,
  isSubmissionStatus,
} from "@/features/submissions/submissions.validation";
import {
  isReviewCriterionOutcome,
  isReviewDecision,
} from "@/features/reviews/reviews.validation";
import type { LearnerReviewFeedback } from "@/features/reviews/review-feedback.types";
import type {
  EvidenceDraft,
  EvidenceLinkType,
  SubmissionHistoryEntry,
} from "@/features/submissions/submissions.types";

type ReviewProjection = {
  id: string;
  submission_id: string;
  decision: string;
  summary: string;
  priority_correction: string | null;
  created_at: string;
  review_criteria: Array<{
    acceptance_criterion_id: string;
    outcome: string;
    note: string | null;
    acceptance_criterion: {
      position: number;
      criterion: string;
    };
  }>;
};

type SubmissionHistoryProjection = {
  id: string;
  version: number;
  evidence_text: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  submission_links: Array<{
    id: string;
    link_type: string;
    label: string;
    url: string;
    position: number;
  }>;
  review: ReviewProjection | null;
};

function mapLearnerReview(
  review: ReviewProjection | null,
  version: number,
): LearnerReviewFeedback | null {
  if (!review) return null;
  if (!isReviewDecision(review.decision)) {
    throw new Error("Submission review contains an unsupported decision.");
  }

  return {
    id: review.id,
    submissionId: review.submission_id,
    version,
    decision: review.decision,
    summary: review.summary,
    priorityCorrection: review.priority_correction,
    createdAt: review.created_at,
    criteria: review.review_criteria
      .map((criterion) => {
        if (!isReviewCriterionOutcome(criterion.outcome)) {
          throw new Error("Submission review contains an unsupported criterion outcome.");
        }
        return {
          criterionId: criterion.acceptance_criterion_id,
          position: criterion.acceptance_criterion.position,
          criterion: criterion.acceptance_criterion.criterion,
          outcome: criterion.outcome,
          note: criterion.note,
        };
      })
      .toSorted((left, right) => left.position - right.position),
  };
}

export async function getEvidenceDraft(projectAssignmentId: string): Promise<EvidenceDraft> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignment_drafts")
    .select("id,evidence_text,updated_at,assignment_draft_links(link_type,label,url,position)")
    .eq("project_assignment_id", projectAssignmentId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the evidence draft.", { cause: error });

  return {
    id: data?.id ?? null,
    projectAssignmentId,
    evidenceText: data?.evidence_text ?? "",
    links: (data?.assignment_draft_links ?? [])
      .toSorted((left, right) => left.position - right.position)
      .map((link) => ({
        type: link.link_type as EvidenceLinkType,
        label: link.label,
        url: link.url,
      })),
    updatedAt: data?.updated_at ?? null,
    expectedUpdatedAt: data?.updated_at ?? "",
  };
}

export async function getSubmissionHistory(
  projectAssignmentId: string,
): Promise<SubmissionHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id,version,evidence_text,status,submitted_at,reviewed_at,submission_links(id,link_type,label,url,position),review:reviews(id,submission_id,decision,summary,priority_correction,created_at,review_criteria(acceptance_criterion_id,outcome,note,acceptance_criterion:acceptance_criteria!inner(position,criterion)))",
    )
    .eq("project_assignment_id", projectAssignmentId)
    .order("version", { ascending: false });

  if (error) throw new Error("Unable to load submission history.", { cause: error });

  return (data as unknown as SubmissionHistoryProjection[]).map((submission) => {
    if (!isSubmissionStatus(submission.status)) {
      throw new Error("Submission history contains an unsupported status.");
    }

    const links = submission.submission_links
      .map((link) => {
        if (!isEvidenceLinkType(link.link_type)) {
          throw new Error("Submission history contains an unsupported link type.");
        }

        return {
          id: link.id,
          type: link.link_type,
          label: link.label,
          url: link.url,
          position: link.position,
        };
      })
      .toSorted((left, right) => left.position - right.position);

    return {
      id: submission.id,
      version: submission.version,
      evidenceText: submission.evidence_text,
      status: submission.status,
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at,
      review: mapLearnerReview(submission.review, submission.version),
      links,
    };
  });
}

export async function getLatestRevisionFeedback(
  projectAssignmentId: string,
): Promise<LearnerReviewFeedback | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id,version,review:reviews!inner(id,submission_id,decision,summary,priority_correction,created_at,review_criteria(acceptance_criterion_id,outcome,note,acceptance_criterion:acceptance_criteria!inner(position,criterion)))",
    )
    .eq("project_assignment_id", projectAssignmentId)
    .eq("status", "revision_required")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error("Unable to load revision feedback.", { cause: error });
  if (!data) return null;

  const projection = data as unknown as {
    id: string;
    version: number;
    review: ReviewProjection;
  };
  return mapLearnerReview(projection.review, projection.version);
}
