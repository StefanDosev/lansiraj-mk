import {
  evidenceLinkTypeOptions,
  type EvidenceLinkType,
  type SubmissionStatus,
} from "@/features/submissions/submissions.types";

export const submissionStatusPresentation: Record<
  SubmissionStatus,
  { label: string; description: string; className: string }
> = {
  submitted: {
    label: "На проверка",
    description: "Испратено и чека човечки преглед.",
    className: "border-cobalt bg-cobalt text-white",
  },
  revision_required: {
    label: "Потребна е корекција",
    description: "Рецензентот побара корекција на оваа верзија.",
    className: "border-coral bg-white text-ink",
  },
  approved: {
    label: "Одобрено",
    description: "Оваа верзија е одобрена.",
    className: "border-ink bg-acid text-ink",
  },
};

const submissionDateFormatter = new Intl.DateTimeFormat("mk-MK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Skopje",
});

export function formatSubmissionDate(value: string): string {
  return submissionDateFormatter.format(new Date(value));
}

export function getEvidenceLinkTypeLabel(type: EvidenceLinkType): string {
  return evidenceLinkTypeOptions.find(([value]) => value === type)?.[1] ?? type;
}
