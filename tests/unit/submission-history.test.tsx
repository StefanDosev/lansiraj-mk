import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SubmissionHistory } from "@/features/submissions/components/submission-history";
import {
  formatSubmissionDate,
  getEvidenceLinkTypeLabel,
  submissionStatusPresentation,
} from "@/features/submissions/submissions.presentation";
import type { SubmissionHistoryEntry } from "@/features/submissions/submissions.types";
import {
  isEvidenceLinkType,
  isSubmissionStatus,
} from "@/features/submissions/submissions.validation";

const newest: SubmissionHistoryEntry = {
  id: "71000000-0000-4000-8000-000000000002",
  version: 2,
  evidenceText: "Ревидирана верзија на доказот.",
  status: "submitted",
  submittedAt: "2026-08-13T10:17:48Z",
  reviewedAt: null,
  links: [
    {
      id: "72000000-0000-4000-8000-000000000002",
      type: "testing",
      label: "Резултати од тестирање",
      url: "https://example.com/testing",
      position: 1,
    },
  ],
};

const older: SubmissionHistoryEntry = {
  id: "71000000-0000-4000-8000-000000000001",
  version: 1,
  evidenceText: "Прва верзија на доказот.",
  status: "revision_required",
  submittedAt: "2026-08-12T08:00:00Z",
  reviewedAt: "2026-08-12T12:30:00Z",
  links: [],
};

describe("submission history presentation", () => {
  it("renders nothing before the first submission", () => {
    expect(renderToStaticMarkup(<SubmissionHistory history={[]} />)).toBe("");
  });

  it("expands the newest version and puts older versions in native disclosures", () => {
    const html = renderToStaticMarkup(<SubmissionHistory history={[newest, older]} />);

    expect(html).toContain("Историја на испраќања");
    expect(html).toContain("Верзија 2");
    expect(html).toContain("Најнова верзија");
    expect(html).toContain("Ревидирана верзија на доказот.");
    expect(html).toContain("Резултати од тестирање");
    expect(html).toContain('href="https://example.com/testing"');
    expect(html).toContain("Верзија 1");
    expect(html).toContain("Прва верзија на доказот.");
    expect(html.match(/<details/g)).toHaveLength(1);
    expect(html.indexOf("Верзија 2")).toBeLessThan(html.indexOf("Верзија 1"));
  });

  it("uses stable Macedonian status, link, and Skopje timestamp labels", () => {
    expect(submissionStatusPresentation.submitted.label).toBe("На проверка");
    expect(submissionStatusPresentation.revision_required.label).toBe("Потребна е корекција");
    expect(submissionStatusPresentation.approved.label).toBe("Одобрено");
    expect(getEvidenceLinkTypeLabel("research")).toBe("Истражување");
    expect(formatSubmissionDate("2026-08-13T10:17:48Z")).toBe("13.8.2026 г., во 12:17");
  });

  it("rejects unsupported database status and link values", () => {
    expect(isSubmissionStatus("approved")).toBe(true);
    expect(isSubmissionStatus("pending")).toBe(false);
    expect(isEvidenceLinkType("preview")).toBe(true);
    expect(isEvidenceLinkType("javascript")).toBe(false);
  });
});
