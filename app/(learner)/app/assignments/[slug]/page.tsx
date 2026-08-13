import { notFound } from "next/navigation";

import { requireCompletedLearnerAccess } from "@/features/auth";
import { AssignmentCurriculum, getCurriculumAssignmentBySlug } from "@/features/curriculum";
import { EvidenceDraftForm, getEvidenceDraft } from "@/features/submissions";

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
  const draft = editable ? await getEvidenceDraft(assignment.projectAssignmentId) : null;

  return (
    <AssignmentCurriculum
      assignment={assignment}
      evidenceEditor={draft ? <EvidenceDraftForm draft={draft} /> : undefined}
    />
  );
}
