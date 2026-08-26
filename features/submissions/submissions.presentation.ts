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

const submissionDateFormatter = new Intl.DateTimeFormat("mk-MK-u-nu-latn", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "Europe/Skopje",
});

export function formatSubmissionDate(value: string): string {
  const parts = Object.fromEntries(
    submissionDateFormatter
      .formatToParts(new Date(value))
      .map(({ type, value: partValue }) => [type, partValue]),
  ) as Partial<Record<Intl.DateTimeFormatPartTypes, string>>;

  if (!parts.day || !parts.month || !parts.year || !parts.hour || !parts.minute) {
    throw new RangeError("Submission date could not be formatted.");
  }

  return `${parts.day}.${parts.month}.${parts.year} г., во ${parts.hour}:${parts.minute}`;
}

export function getEvidenceLinkTypeLabel(type: EvidenceLinkType): string {
  return evidenceLinkTypeOptions.find(([value]) => value === type)?.[1] ?? type;
}
