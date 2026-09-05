import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";

type DashboardProgress = {
  approved: number;
  total: number;
};

export type CurrentAssignmentDashboard =
  | { kind: "empty"; progress: DashboardProgress }
  | { kind: "complete"; progress: DashboardProgress }
  | {
      kind: "locked";
      progress: DashboardProgress;
      assignment: ProjectAssignmentSummary["assignment"];
      statusLabel: string;
      unlockCondition: string;
    }
  | {
      kind: "current";
      progress: DashboardProgress;
      projectAssignmentId: string;
      assignment: ProjectAssignmentSummary["assignment"];
      state: Exclude<ProjectAssignmentSummary["state"], "locked" | "approved">;
      statusLabel: string;
      statusDescription: string;
      unlockCondition: string;
      feedbackMessage: string;
      actionLabel: string;
    };
