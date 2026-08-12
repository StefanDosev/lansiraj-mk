import { notFound } from "next/navigation";
import { ProjectScopeSummary } from "@/features/projects/components/project-scope-summary";
import { ScopeAssessmentForm } from "@/features/projects/components/scope-assessment-form";
import { getProjectForReview } from "@/features/projects/projects.queries";
import { projectIdSchema } from "@/features/projects/projects.schema";

export default async function ProjectScopeReviewPage({ params }: Readonly<{ params: Promise<{ projectId: string }> }>) {
  const { projectId } = await params;
  if (!projectIdSchema.safeParse(projectId).success) notFound();
  const project = await getProjectForReview(projectId);
  if (!project) notFound();
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start"><ProjectScopeSummary project={project} audience="reviewer" /><div className="xl:sticky xl:top-6"><ScopeAssessmentForm projectId={project.id} assessment={project.scopeAssessment} /></div></div>;
}
