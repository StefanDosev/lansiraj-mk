import {
  evidenceLinkTypes,
  submissionStatuses,
  type EvidenceLinkType,
  type SubmissionStatus,
} from "@/features/submissions/submissions.types";

const evidenceLinkTypeSet = new Set<string>(evidenceLinkTypes);
const submissionStatusSet = new Set<string>(submissionStatuses);

export function isEvidenceLinkType(value: string): value is EvidenceLinkType {
  return evidenceLinkTypeSet.has(value);
}

export function isSubmissionStatus(value: string): value is SubmissionStatus {
  return submissionStatusSet.has(value);
}
