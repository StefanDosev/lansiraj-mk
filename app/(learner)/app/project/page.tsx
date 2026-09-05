import type { Metadata } from "next";

import { requireCompletedLearnerAccess } from "@/features/auth";
import { deriveProjectJourney, ProjectJourney } from "@/features/journey";
import { ProjectScopeSummary } from "@/features/projects/components/project-scope-summary";
import { getCurrentProject } from "@/features/projects/projects.queries";

export const metadata: Metadata = {
  title: "Проект",
};

export default async function ProjectFoundationPage() {
  await requireCompletedLearnerAccess();
  const project = await getCurrentProject();
  const journey = deriveProjectJourney(project.assignments, project.liveUrl);
  return (
    <div className="space-y-8">
      <ProjectScopeSummary project={project} audience="learner" />
      <ProjectJourney journey={journey} />
    </div>
  );
}
