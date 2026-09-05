import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";

export type JourneyState = ProjectAssignmentSummary["state"];

export type JourneyTask = {
  position: number;
  slug: string;
  title: string;
  state: JourneyState;
  stateLabel: string;
  unlockCondition: string | null;
  isCurrent: boolean;
};

export type JourneyStage = {
  position: number;
  title: string;
  state: JourneyState;
  stateLabel: string;
  isCurrent: boolean;
  tasks: JourneyTask[];
};

export type JourneyEndpoint =
  | { kind: "locked"; unlockCondition: string }
  | { kind: "live"; url: string }
  | { kind: "missing_url"; message: string };

export type ProjectJourney = {
  stages: JourneyStage[];
  endpoint: JourneyEndpoint;
  approvedCount: number;
  taskCount: number;
};
