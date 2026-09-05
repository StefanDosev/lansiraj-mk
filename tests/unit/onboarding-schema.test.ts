import { describe, expect, it } from "vitest";
import { createOnboardingSchema, getOnboardingDateLimits } from "@/features/onboarding/onboarding.schema";

const now = new Date("2026-08-10T12:00:00.000Z");
const valid = { displayName: "Ана", projectTitle: "Мал планер", targetUser: "Студенти што учат самостојно", problemStatement: "Ги губат малите задачи и не знаат што е следно.", coreAction: "Да ја означат следната важна задача.", nonFeatures: "Плаќања\nChat\nМобилна апликација", weeklyHours: "5", targetLaunchDate: "2026-09-07" };

describe("learner onboarding schema", () => {
  it("normalizes non-features and numeric hours", () => {
    const result = createOnboardingSchema(now).parse(valid);
    expect(result.nonFeatures).toEqual(["Плаќања", "Chat", "Мобилна апликација"]);
    expect(result.weeklyHours).toBe(5);
  });

  it("uses tomorrow through twelve weeks as date limits", () => {
    expect(getOnboardingDateLimits(now)).toEqual({ minimum: "2026-08-11", maximum: "2026-11-02" });
  });

  it("rejects vague scope, excessive hours, and dates outside the window", () => {
    const result = createOnboardingSchema(now).safeParse({ ...valid, targetUser: "Сите", weeklyHours: "21", targetLaunchDate: "2027-01-01" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors).toMatchObject({ targetUser: expect.any(Array), weeklyHours: expect.any(Array), targetLaunchDate: expect.any(Array) });
  });
});
