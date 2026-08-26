import "server-only";

import { buildReviewerWorkspace } from "@/features/reviews/reviews.presentation";
import type {
  ReviewerCompletedReview,
  ReviewerSubmissionDetail,
  ReviewerWorkspace,
  ReviewerWorkspaceSource,
} from "@/features/reviews/reviews.types";
import {
  isReviewCriterionOutcome,
  isReviewDecision,
  isReviewerAssignmentState,
  isReviewerCohortStatus,
  isReviewerProjectStatus,
} from "@/features/reviews/reviews.validation";
import { isEvidenceLinkType, isSubmissionStatus } from "@/features/submissions/submissions.validation";
import type { ImmutableSubmissionVersion } from "@/features/submissions/submissions.types";
import { createClient } from "@/lib/supabase/server";

type QueueProjection = {
  id: string;
  version: number;
  submitted_at: string;
  project_assignment: {
    project: {
      id: string;
      owner_id: string;
      cohort_id: string;
      title: string;
      cohort: { name: string };
    };
    assignment: {
      position: number;
      title: string;
      stage: { position: number; title: string };
    };
  };
};

type ProjectProjection = {
  id: string;
  owner_id: string;
  cohort_id: string;
  title: string;
  status: string;
  updated_at: string;
  project_assignments: Array<{
    state: string;
    assignment: {
      position: number;
      title: string;
      stage: { position: number; title: string };
    };
  }>;
};

type SubmissionDetailProjection = {
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
  project_assignment: {
    id: string;
    project: {
      id: string;
      owner_id: string;
      cohort_id: string;
      title: string;
      cohort: { name: string };
    };
    assignment: {
      id: string;
      position: number;
      title: string;
      stage: { position: number; title: string };
      acceptance_criteria: Array<{
        id: string;
        position: number;
        criterion: string;
      }>;
    };
  };
};

type SubmissionHistoryProjection = Omit<
  SubmissionDetailProjection,
  "project_assignment"
>;

type CompletedReviewProjection = {
  id: string;
  decision: string;
  summary: string;
  priority_correction: string | null;
  created_at: string;
  review_criteria: Array<{
    acceptance_criterion_id: string;
    outcome: string;
    note: string | null;
  }>;
};

function mapSubmissionHistoryEntry(
  submission: SubmissionHistoryProjection,
): ImmutableSubmissionVersion {
  if (!isSubmissionStatus(submission.status)) {
    throw new Error("Submission history contains an unsupported status.");
  }

  return {
    id: submission.id,
    version: submission.version,
    evidenceText: submission.evidence_text,
    status: submission.status,
    submittedAt: submission.submitted_at,
    reviewedAt: submission.reviewed_at,
    links: submission.submission_links
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
      .toSorted((left, right) => left.position - right.position),
  };
}

function mapCompletedReview(
  review: CompletedReviewProjection | null,
): ReviewerCompletedReview | null {
  if (!review) return null;
  if (!isReviewDecision(review.decision)) {
    throw new Error("Reviewer submission contains an unsupported decision.");
  }

  return {
    id: review.id,
    decision: review.decision,
    summary: review.summary,
    priorityCorrection: review.priority_correction,
    createdAt: review.created_at,
    criteria: review.review_criteria.map((criterion) => {
      if (!isReviewCriterionOutcome(criterion.outcome)) {
        throw new Error("Reviewer submission contains an unsupported criterion outcome.");
      }
      return {
        criterionId: criterion.acceptance_criterion_id,
        outcome: criterion.outcome,
        note: criterion.note,
      };
    }),
  };
}

export async function getReviewerWorkspace(): Promise<ReviewerWorkspace> {
  const supabase = await createClient();
  const [queueResult, cohortsResult, membersResult, profilesResult, projectsResult] =
    await Promise.all([
      supabase
        .from("submissions")
        .select(
          "id,version,submitted_at,project_assignment:project_assignments!inner(project:projects!inner(id,owner_id,cohort_id,title,cohort:cohorts!inner(name)),assignment:assignments!inner(position,title,stage:curriculum_stages!inner(position,title)))",
        )
        .eq("status", "submitted")
        .order("submitted_at", { ascending: true })
        .order("id", { ascending: true }),
      supabase
        .from("cohorts")
        .select("id,name,status,starts_at,ends_at")
        .neq("status", "archived"),
      supabase
        .from("cohort_members")
        .select("cohort_id,user_id,joined_at")
        .eq("status", "active"),
      supabase
        .from("profiles")
        .select("user_id,display_name,onboarding_completed_at"),
      supabase
        .from("projects")
        .select(
          "id,owner_id,cohort_id,title,status,updated_at,project_assignments(state,assignment:assignments(position,title,stage:curriculum_stages(position,title)))",
        )
        .neq("status", "archived"),
    ]);

  if (queueResult.error) throw new Error("Unable to load the reviewer queue.", { cause: queueResult.error });
  if (cohortsResult.error) throw new Error("Unable to load reviewer cohorts.", { cause: cohortsResult.error });
  if (membersResult.error) throw new Error("Unable to load cohort members.", { cause: membersResult.error });
  if (profilesResult.error) throw new Error("Unable to load learner profiles.", { cause: profilesResult.error });
  if (projectsResult.error) throw new Error("Unable to load cohort projects.", { cause: projectsResult.error });

  const cohorts: ReviewerWorkspaceSource["cohorts"] = cohortsResult.data.map((cohort) => {
    if (!isReviewerCohortStatus(cohort.status)) {
      throw new Error("Reviewer workspace contains an unsupported cohort status.");
    }
    return {
      id: cohort.id,
      name: cohort.name,
      status: cohort.status,
      startsAt: cohort.starts_at,
      endsAt: cohort.ends_at,
    };
  });

  const projects: ReviewerWorkspaceSource["projects"] = (
    projectsResult.data as unknown as ProjectProjection[]
  ).map((project) => {
    if (!isReviewerProjectStatus(project.status)) {
      throw new Error("Reviewer workspace contains an unsupported project status.");
    }

    return {
      id: project.id,
      ownerId: project.owner_id,
      cohortId: project.cohort_id,
      title: project.title,
      status: project.status,
      updatedAt: project.updated_at,
      assignments: project.project_assignments.map((projection) => {
        if (!isReviewerAssignmentState(projection.state)) {
          throw new Error("Reviewer workspace contains an unsupported assignment state.");
        }
        return {
          state: projection.state,
          position: projection.assignment.position,
          title: projection.assignment.title,
          stagePosition: projection.assignment.stage.position,
          stageTitle: projection.assignment.stage.title,
        };
      }),
    };
  });

  const source: ReviewerWorkspaceSource = {
    cohorts,
    members: membersResult.data.map((member) => ({
      cohortId: member.cohort_id,
      userId: member.user_id,
      joinedAt: member.joined_at,
    })),
    profiles: profilesResult.data.map((profile) => ({
      userId: profile.user_id,
      displayName: profile.display_name,
      onboardingCompletedAt: profile.onboarding_completed_at,
    })),
    projects,
    pendingSubmissions: (queueResult.data as unknown as QueueProjection[]).map((submission) => ({
      id: submission.id,
      version: submission.version,
      submittedAt: submission.submitted_at,
      learnerId: submission.project_assignment.project.owner_id,
      projectId: submission.project_assignment.project.id,
      projectTitle: submission.project_assignment.project.title,
      cohortId: submission.project_assignment.project.cohort_id,
      cohortName: submission.project_assignment.project.cohort.name,
      assignmentPosition: submission.project_assignment.assignment.position,
      assignmentTitle: submission.project_assignment.assignment.title,
      stagePosition: submission.project_assignment.assignment.stage.position,
      stageTitle: submission.project_assignment.assignment.stage.title,
    })),
  };

  return buildReviewerWorkspace(source);
}

export async function getSubmissionForReview(
  submissionId: string,
): Promise<ReviewerSubmissionDetail | null> {
  const supabase = await createClient();
  const [submissionResult, reviewResult] = await Promise.all([
    supabase
      .from("submissions")
      .select(
        "id,version,evidence_text,status,submitted_at,reviewed_at,submission_links(id,link_type,label,url,position),project_assignment:project_assignments!inner(id,project:projects!inner(id,owner_id,cohort_id,title,cohort:cohorts!inner(name)),assignment:assignments!inner(id,position,title,stage:curriculum_stages!inner(position,title),acceptance_criteria(id,position,criterion)))",
      )
      .eq("id", submissionId)
      .maybeSingle(),
    supabase
      .from("reviews")
      .select(
        "id,decision,summary,priority_correction,created_at,review_criteria(acceptance_criterion_id,outcome,note)",
      )
      .eq("submission_id", submissionId)
      .maybeSingle(),
  ]);

  if (submissionResult.error) {
    throw new Error("Unable to load the immutable submission.", { cause: submissionResult.error });
  }
  if (!submissionResult.data) return null;
  if (reviewResult.error) {
    throw new Error("Unable to load the submission review.", { cause: reviewResult.error });
  }

  const submission = submissionResult.data as unknown as SubmissionDetailProjection;
  if (!isSubmissionStatus(submission.status)) {
    throw new Error("Reviewer submission contains an unsupported status.");
  }

  const project = submission.project_assignment.project;
  const assignment = submission.project_assignment.assignment;
  const [profileResult, historyResult, membershipResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", project.owner_id)
      .maybeSingle(),
    supabase
      .from("submissions")
      .select(
        "id,version,evidence_text,status,submitted_at,reviewed_at,submission_links(id,link_type,label,url,position)",
      )
      .eq("project_assignment_id", submission.project_assignment.id)
      .order("version", { ascending: false }),
    supabase
      .from("cohort_members")
      .select("status")
      .eq("cohort_id", project.cohort_id)
      .eq("user_id", project.owner_id)
      .maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error("Unable to load the submission learner.", { cause: profileResult.error });
  }
  if (historyResult.error) {
    throw new Error("Unable to load submission history.", { cause: historyResult.error });
  }
  if (membershipResult.error) {
    throw new Error("Unable to load submission membership.", { cause: membershipResult.error });
  }

  const currentSubmission = mapSubmissionHistoryEntry(submission);

  return {
    id: submission.id,
    projectAssignmentId: submission.project_assignment.id,
    version: submission.version,
    evidenceText: submission.evidence_text,
    status: submission.status,
    reviewable: membershipResult.data?.status === "active",
    submittedAt: submission.submitted_at,
    reviewedAt: submission.reviewed_at,
    learnerId: project.owner_id,
    learnerName: profileResult.data?.display_name ?? "Неименуван ученик",
    projectId: project.id,
    projectTitle: project.title,
    cohortId: project.cohort_id,
    cohortName: project.cohort.name,
    assignmentPosition: assignment.position,
    assignmentTitle: assignment.title,
    stagePosition: assignment.stage.position,
    stageTitle: assignment.stage.title,
    criteria: assignment.acceptance_criteria.toSorted(
      (left, right) => left.position - right.position,
    ),
    history: (historyResult.data as unknown as SubmissionHistoryProjection[]).map(
      mapSubmissionHistoryEntry,
    ),
    review: mapCompletedReview(
      reviewResult.data as unknown as CompletedReviewProjection | null,
    ),
    links: currentSubmission.links,
  };
}
