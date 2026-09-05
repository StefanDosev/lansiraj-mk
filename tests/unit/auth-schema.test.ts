import { describe, expect, it } from "vitest";

import { magicLinkSchema } from "@/features/auth/auth.schema";

describe("magicLinkSchema", () => {
  it("normalizes an invited email request with a provider challenge token", () => {
    expect(
      magicLinkSchema.parse({
        email: "Invited@Example.Test",
        captchaToken: "verified-challenge-token",
      }),
    ).toEqual({
      email: "invited@example.test",
      captchaToken: "verified-challenge-token",
    });
  });

  it("rejects a missing provider challenge token", () => {
    expect(
      magicLinkSchema.safeParse({ email: "invited@example.test", captchaToken: "" }).success,
    ).toBe(false);
  });

  it("caps provider challenge input before the Auth request", () => {
    expect(
      magicLinkSchema.safeParse({
        email: "invited@example.test",
        captchaToken: "x".repeat(4097),
      }).success,
    ).toBe(false);
  });
});
