import { notFound } from "next/navigation";

import { requireCompletedLearnerAccess } from "@/features/auth";
import { AssignmentCurriculum, getCurriculumAssignmentBySlug } from "@/features/curriculum";
import {
  EvidenceDraftForm,
  getEvidenceDraft,
  getSubmissionHistory,
  SubmissionHistory,
} from "@/features/submissions";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireCompletedLearnerAccess();
  const assignment = await getCurriculumAssignmentBySlug(slug);

  if (!assignment) notFound();

  const editable = assignment.state === "available" || assignment.state === "revision_required";
  const [draft, history] = await Promise.all([
    editable ? getEvidenceDraft(assignment.projectAssignmentId) : Promise.resolve(null),
    getSubmissionHistory(assignment.projectAssignmentId),
  ]);

  return (
    <AssignmentCurriculum
      assignment={assignment}
      evidenceEditor={draft ? <EvidenceDraftForm draft={draft} /> : undefined}
      submissionHistory={history.length > 0 ? <SubmissionHistory history={history} /> : undefined}
    />
  );
}
