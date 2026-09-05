import { describe, expect, it } from "vitest";
import { scopeAssessmentSchema } from "@/features/projects/projects.schema";

const projectId = "93000000-0000-4000-8000-000000000001";

describe("scopeAssessmentSchema", () => {
  it("accepts a ready assessment without a note", () => {
    expect(scopeAssessmentSchema.parse({ projectId, readiness: "ready", note: "" })).toEqual({ projectId, readiness: "ready", note: "" });
  });

  it("requires a useful note when reduction is needed", () => {
    const result = scopeAssessmentSchema.safeParse({ projectId, readiness: "needs_reduction", note: "short" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.note).toBeDefined();
  });

  it("rejects invalid project IDs and decisions", () => {
    expect(scopeAssessmentSchema.safeParse({ projectId: "not-a-project", readiness: "maybe", note: "" }).success).toBe(false);
  });

  it("trims and accepts a concrete reduction note", () => {
    expect(scopeAssessmentSchema.parse({ projectId, readiness: "needs_reduction", note: "  Reduce the core action.  " }).note).toBe("Reduce the core action.");
  });
});
