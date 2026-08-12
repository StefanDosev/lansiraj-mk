import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CurrentProject, ProjectAssignmentSummary, ProjectScopeAssessment } from "@/features/projects/projects.types";

const projectProjection = `
  id,
  title,
  target_user,
  problem_statement,
  core_action,
  non_features,
  weekly_hours,
  target_launch_date,
  status,
  curriculum_version,
  project_scope_assessments(readiness,note,reviewed_at),
  project_assignments(
    state,
    available_at,
    assignment:assignments(position,slug,title)
  )
`;

type ProjectProjection = {
  id: string;
  title: string;
  target_user: string;
  problem_statement: string;
  core_action: string;
  non_features: string[];
  weekly_hours: number;
  target_launch_date: string;
  status: CurrentProject["status"];
  curriculum_version: string | null;
  project_scope_assessments: { readiness: string; note: string | null; reviewed_at: string } | null;
  project_assignments: Array<{
    state: ProjectAssignmentSummary["state"];
    available_at: string | null;
    assignment: ProjectAssignmentSummary["assignment"];
  }>;
};

function mapProject(data: ProjectProjection): CurrentProject {
  const assessment = data.project_scope_assessments;
  const scopeAssessment: ProjectScopeAssessment | null = assessment
    ? {
        readiness: assessment.readiness as ProjectScopeAssessment["readiness"],
        note: assessment.note,
        reviewedAt: assessment.reviewed_at,
      }
    : null;

  return {
    id: data.id,
    title: data.title,
    targetUser: data.target_user,
    problemStatement: data.problem_statement,
    coreAction: data.core_action,
    nonFeatures: data.non_features,
    weeklyHours: data.weekly_hours,
    targetLaunchDate: data.target_launch_date,
    status: data.status,
    curriculumVersion: data.curriculum_version,
    assignments: data.project_assignments
      .map((projection) => ({
        state: projection.state,
        availableAt: projection.available_at,
        assignment: projection.assignment,
      }))
      .toSorted((left, right) => left.assignment.position - right.assignment.position),
    scopeAssessment,
  };
}

export async function getCurrentProject(): Promise<CurrentProject> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) throw new Error("Authenticated learner required.");

  const { data, error } = await supabase
    .from("projects")
    .select(projectProjection)
    .eq("owner_id", userId)
    .in("status", ["draft", "active"])
    .maybeSingle();

  if (error) throw new Error("Unable to load the learner project.", { cause: error });
  if (!data) throw new Error("Completed onboarding has no current project.");

  return mapProject(data as ProjectProjection);
}

export async function getProjectForReview(projectId: string): Promise<CurrentProject | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) throw new Error("Authenticated reviewer required.");

  const { data, error } = await supabase
    .from("projects")
    .select(projectProjection)
    .eq("id", projectId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the project scope.", { cause: error });
  return data ? mapProject(data as ProjectProjection) : null;
}
