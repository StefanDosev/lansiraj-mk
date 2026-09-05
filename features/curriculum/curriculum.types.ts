import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";

export type AcceptanceCriterion = {
  id: string;
  position: number;
  criterion: string;
};

export type CurriculumAssignmentSummary = {
  position: number;
  slug: string;
  title: string;
  state: ProjectAssignmentSummary["state"];
};

export type CurriculumAssignment = CurriculumAssignmentSummary & {
  projectAssignmentId: string;
  curriculumVersion: string;
  bodyMarkdown: string;
  proofPromptMarkdown: string;
  requiresReview: boolean;
  stage: {
    position: number;
    slug: string;
    title: string;
    summaryMarkdown: string;
  };
  acceptanceCriteria: AcceptanceCriterion[];
};
