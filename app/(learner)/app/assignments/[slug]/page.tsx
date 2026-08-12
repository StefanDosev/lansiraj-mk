import { notFound } from "next/navigation";

import { requireCompletedLearnerAccess } from "@/features/auth";
import { AssignmentCurriculum, getCurriculumAssignmentBySlug } from "@/features/curriculum";

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireCompletedLearnerAccess();
  const assignment = await getCurriculumAssignmentBySlug(slug);

  if (!assignment) notFound();

  return <AssignmentCurriculum assignment={assignment} />;
}
