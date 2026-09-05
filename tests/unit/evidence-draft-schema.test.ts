import { describe, expect, it } from "vitest";

import {
  evidenceDraftSchema,
  evidenceSubmissionSchema,
} from "@/features/submissions/submissions.schema";

const baseDraft = {
  projectAssignmentId: "84000000-0000-4000-8000-000000000001",
  evidenceText: "",
  links: [],
  expectedUpdatedAt: "",
};

describe("evidenceDraftSchema", () => {
  it("accepts a completely blank draft", () => {
    expect(evidenceDraftSchema.safeParse(baseDraft).success).toBe(true);
  });

  it("accepts ordered typed HTTPS links and a concurrency timestamp", () => {
    const result = evidenceDraftSchema.safeParse({
      ...baseDraft,
      evidenceText: "Completed three interviews.",
      expectedUpdatedAt: "2026-08-13T08:30:00.000Z",
      links: [
        { type: "research", label: "Interview notes", url: "https://example.com/notes" },
        { type: "other", label: "Summary", url: "https://example.com/summary" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-HTTPS and unsupported link types", () => {
    const result = evidenceDraftSchema.safeParse({
      ...baseDraft,
      links: [{ type: "document", label: "Notes", url: "http://example.com/notes" }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual([
        "links.0.type",
        "links.0.url",
      ]);
    }
  });

  it("rejects more than ten links and oversized evidence", () => {
    const links = Array.from({ length: 11 }, (_, index) => ({
      type: "other" as const,
      label: `Link ${index + 1}`,
      url: `https://example.com/${index + 1}`,
    }));
    const result = evidenceDraftSchema.safeParse({
      ...baseDraft,
      evidenceText: "a".repeat(10001),
      links,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("evidenceText");
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("links");
    }
  });
});

describe("evidenceSubmissionSchema", () => {
  const submission = {
    projectAssignmentId: "84000000-0000-4000-8000-000000000001",
    expectedUpdatedAt: "2026-08-13T08:30:00.000Z",
    confirmation: "confirmed",
  };

  it("accepts a saved draft timestamp with explicit confirmation", () => {
    expect(evidenceSubmissionSchema.safeParse(submission).success).toBe(true);
  });

  it("rejects a missing saved draft timestamp", () => {
    expect(evidenceSubmissionSchema.safeParse({
      ...submission,
      expectedUpdatedAt: "",
    }).success).toBe(false);
  });

  it("rejects submission without explicit confirmation", () => {
    expect(evidenceSubmissionSchema.safeParse({
      ...submission,
      confirmation: "",
    }).success).toBe(false);
  });
});
