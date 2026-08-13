export const evidenceLinkTypes = [
  "research",
  "figma",
  "repository",
  "preview",
  "live",
  "testing",
  "other",
] as const;

export type EvidenceLinkType = (typeof evidenceLinkTypes)[number];

export const evidenceLinkTypeOptions = [
  ["research", "Истражување"],
  ["figma", "Figma"],
  ["repository", "Repository"],
  ["preview", "Preview"],
  ["live", "Live проект"],
  ["testing", "Тестирање"],
  ["other", "Друго"],
] as const satisfies ReadonlyArray<readonly [EvidenceLinkType, string]>;

export const submissionStatuses = ["submitted", "revision_required", "approved"] as const;

export type SubmissionStatus = (typeof submissionStatuses)[number];

export type EvidenceDraftLink = {
  type: EvidenceLinkType;
  label: string;
  url: string;
};

export type EvidenceDraftValues = {
  projectAssignmentId: string;
  evidenceText: string;
  links: EvidenceDraftLink[];
  expectedUpdatedAt: string;
};

export type EvidenceDraft = EvidenceDraftValues & {
  id: string | null;
  updatedAt: string | null;
};

export type SubmissionHistoryLink = {
  id: string;
  type: EvidenceLinkType;
  label: string;
  url: string;
  position: number;
};

export type SubmissionHistoryEntry = {
  id: string;
  version: number;
  evidenceText: string;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  links: SubmissionHistoryLink[];
};

export type EvidenceDraftFieldErrors = {
  evidenceText?: string[];
  links?: Array<Partial<Record<keyof EvidenceDraftLink, string[]>>>;
};

export type EvidenceDraftState =
  | { status: "idle"; values: EvidenceDraftValues }
  | { status: "success"; values: EvidenceDraftValues; message: string }
  | {
      status: "error";
      values: EvidenceDraftValues;
      message: string;
      fieldErrors?: EvidenceDraftFieldErrors;
      conflict?: boolean;
    };

export type EvidenceSubmissionValues = {
  projectAssignmentId: string;
  expectedUpdatedAt: string;
  confirmation: string;
};

export type EvidenceSubmissionState =
  | { status: "idle"; values: EvidenceSubmissionValues }
  | { status: "success"; values: EvidenceSubmissionValues; message: string }
  | {
      status: "error";
      values: EvidenceSubmissionValues;
      message: string;
      conflict?: boolean;
    };
