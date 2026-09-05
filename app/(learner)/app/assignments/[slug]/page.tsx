import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { requireCompletedLearnerAccess } from "@/features/auth";
import {
  AssignmentCurriculum,
  getCurriculumAssignmentBySlug,
  getCurriculumAssignments,
} from "@/features/curriculum";
import { deriveApprovedAssignmentNextStep } from "@/features/curriculum/approval";
import { ActiveRevisionFeedback } from "@/features/reviews/components/learner-review-feedback";
import { ApprovedAssignmentCheckpoint } from "@/features/reviews/components/approved-assignment-checkpoint";
import {
  EvidenceDraftForm,
  getEvidenceDraft,
  getSubmissionHistory,
  SubmissionHistory,
} from "@/features/submissions";

type AssignmentPageProps = {
  params: Promise<{ slug: string }>;
};

const getAssignment = cache(getCurriculumAssignmentBySlug);

export async function generateMetadata({ params }: AssignmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const assignment = await getAssignment(slug);

  return {
    title: assignment?.title ?? "Задачата не е пронајдена",
  };
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { slug } = await params;
  await requireCompletedLearnerAccess();
  const assignment = await getAssignment(slug);

  if (!assignment) notFound();

  const editable = assignment.state === "available" || assignment.state === "revision_required";
  const [draft, history, assignments] = await Promise.all([
    editable ? getEvidenceDraft(assignment.projectAssignmentId) : Promise.resolve(null),
    getSubmissionHistory(assignment.projectAssignmentId),
    assignment.state === "approved" ? getCurriculumAssignments() : Promise.resolve([]),
  ]);
  const activeRevision = assignment.state === "revision_required"
    ? history.find((submission) => submission.status === "revision_required")?.review ?? null
    : null;
  const approvedReview = assignment.state === "approved"
    ? history.find((submission) => submission.status === "approved")?.review ?? null
    : null;
  const approvedNextStep = deriveApprovedAssignmentNextStep(assignment, assignments);

  return (
    <AssignmentCurriculum
      assignment={assignment}
      approvalCheckpoint={approvedNextStep ? (
        <ApprovedAssignmentCheckpoint review={approvedReview} nextStep={approvedNextStep} />
      ) : undefined}
      revisionFeedback={assignment.state === "revision_required" ? <ActiveRevisionFeedback feedback={activeRevision} /> : undefined}
      evidenceEditor={draft ? <EvidenceDraftForm draft={draft} /> : undefined}
      submissionHistory={history.length > 0 ? <SubmissionHistory history={history} /> : undefined}
    />
  );
}
