import type {
  CurriculumAssignment,
  CurriculumAssignmentSummary,
} from "@/features/curriculum/curriculum.types";

export type ApprovedAssignmentNextStep =
  | { kind: "next"; assignment: CurriculumAssignmentSummary }
  | { kind: "locked"; assignment: CurriculumAssignmentSummary }
  | { kind: "complete" };

export function deriveApprovedAssignmentNextStep(
  assignment: CurriculumAssignment,
  assignments: CurriculumAssignmentSummary[],
): ApprovedAssignmentNextStep | null {
  if (assignment.state !== "approved") return null;

  let nextAssignment: CurriculumAssignmentSummary | null = null;
  for (const candidate of assignments) {
    if (
      candidate.position > assignment.position
      && (!nextAssignment || candidate.position < nextAssignment.position)
    ) {
      nextAssignment = candidate;
    }
  }

  if (!nextAssignment) return { kind: "complete" };
  if (nextAssignment.state === "locked") {
    return { kind: "locked", assignment: nextAssignment };
  }

  return { kind: "next", assignment: nextAssignment };
}
