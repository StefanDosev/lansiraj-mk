export type ProjectAssignmentSummary = {
  state: "locked" | "available" | "submitted" | "revision_required" | "approved";
  availableAt: string | null;
  assignment: {
    position: number;
    slug: string;
    title: string;
  };
};

export type CurrentProject = {
  id: string;
  title: string;
  targetUser: string;
  problemStatement: string;
  coreAction: string;
  nonFeatures: string[];
  weeklyHours: number;
  targetLaunchDate: string;
  status: "draft" | "active" | "completed" | "archived";
  curriculumVersion: string | null;
  assignments: ProjectAssignmentSummary[];
  scopeAssessment: ProjectScopeAssessment | null;
};

export type ProjectScopeReadiness = "ready" | "needs_reduction";

export type ProjectScopeAssessment = {
  readiness: ProjectScopeReadiness;
  note: string | null;
  reviewedAt: string;
};

export type ScopeAssessmentValues = {
  projectId: string;
  readiness: ProjectScopeReadiness;
  note: string;
};

export type ScopeAssessmentField = keyof ScopeAssessmentValues;

export type ScopeAssessmentState =
  | { status: "idle"; values: ScopeAssessmentValues }
  | { status: "success"; values: ScopeAssessmentValues; message: string }
  | {
      status: "error";
      values: ScopeAssessmentValues;
      message: string;
      fieldErrors?: Partial<Record<ScopeAssessmentField, string[]>>;
    };

export type StartProjectState =
  | { status: "idle" }
  | { status: "error"; message: string };
