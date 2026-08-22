import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  CurriculumAssignment,
  CurriculumAssignmentSummary,
} from "@/features/curriculum/curriculum.types";

const assignmentDetailProjection = `
  id,
  state,
  project:projects!inner(owner_id,status,curriculum_version),
  assignment:assignments!inner(
    curriculum_version,
    position,
    slug,
    title,
    body_md,
    proof_prompt_md,
    requires_review,
    stage:curriculum_stages!inner(position,slug,title,summary_md),
    acceptance_criteria(id,position,criterion)
  )
`;

type AssignmentDetailProjection = {
  id: string;
  state: CurriculumAssignment["state"];
  project: {
    owner_id: string;
    status: string;
    curriculum_version: string | null;
  };
  assignment: {
    curriculum_version: string;
    position: number;
    slug: string;
    title: string;
    body_md: string;
    proof_prompt_md: string;
    requires_review: boolean;
    stage: {
      position: number;
      slug: string;
      title: string;
      summary_md: string;
    };
    acceptance_criteria: Array<{
      id: string;
      position: number;
      criterion: string;
    }>;
  };
};

async function getAuthenticatedLearnerId() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) throw new Error("Authenticated learner required.");
  return { supabase, userId };
}

function mapAssignment(data: AssignmentDetailProjection): CurriculumAssignment {
  return {
    projectAssignmentId: data.id,
    curriculumVersion: data.assignment.curriculum_version,
    position: data.assignment.position,
    slug: data.assignment.slug,
    title: data.assignment.title,
    bodyMarkdown: data.assignment.body_md,
    proofPromptMarkdown: data.assignment.proof_prompt_md,
    requiresReview: data.assignment.requires_review,
    state: data.state,
    stage: {
      position: data.assignment.stage.position,
      slug: data.assignment.stage.slug,
      title: data.assignment.stage.title,
      summaryMarkdown: data.assignment.stage.summary_md,
    },
    acceptanceCriteria: data.assignment.acceptance_criteria
      .map((item) => ({
        id: item.id,
        position: item.position,
        criterion: item.criterion,
      }))
      .toSorted((left, right) => left.position - right.position),
  };
}

export async function getCurriculumAssignmentBySlug(
  slug: string,
): Promise<CurriculumAssignment | null> {
  const { supabase, userId } = await getAuthenticatedLearnerId();
  const { data, error } = await supabase
    .from("project_assignments")
    .select(assignmentDetailProjection)
    .eq("project.owner_id", userId)
    .in("project.status", ["active", "completed"])
    .eq("assignment.slug", slug)
    .maybeSingle();

  if (error) throw new Error("Unable to load the curriculum assignment.", { cause: error });
  if (!data) return null;

  const projection = data as unknown as AssignmentDetailProjection;
  if (projection.project.curriculum_version !== projection.assignment.curriculum_version) {
    return null;
  }

  return mapAssignment(projection);
}

export async function getCurriculumAssignments(): Promise<CurriculumAssignmentSummary[]> {
  const { supabase, userId } = await getAuthenticatedLearnerId();
  const { data, error } = await supabase
    .from("project_assignments")
    .select(
      "state,project:projects!inner(owner_id,status,curriculum_version),assignment:assignments!inner(curriculum_version,position,slug,title)",
    )
    .eq("project.owner_id", userId)
    .in("project.status", ["active", "completed"]);

  if (error) throw new Error("Unable to load the curriculum assignments.", { cause: error });

  return data
    .flatMap((item) =>
      item.project.curriculum_version === item.assignment.curriculum_version
        ? [
            {
              position: item.assignment.position,
              slug: item.assignment.slug,
              title: item.assignment.title,
              state: item.state as CurriculumAssignmentSummary["state"],
            },
          ]
        : [],
    )
    .toSorted((left, right) => left.position - right.position);
}
