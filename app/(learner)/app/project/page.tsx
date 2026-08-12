import { requireCompletedLearnerAccess } from "@/features/auth";
import { ProjectScopeSummary } from "@/features/projects/components/project-scope-summary";
import { getCurrentProject } from "@/features/projects/projects.queries";

export default async function ProjectFoundationPage() {
  await requireCompletedLearnerAccess();
  const project = await getCurrentProject();
  return <ProjectScopeSummary project={project} audience="learner" />;
}
