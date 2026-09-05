import { describe, expect, it } from "vitest";

import { isAuthRateLimitFailure } from "@/features/auth/auth-rate-limit";

describe("auth request rate limiting", () => {
  it("recognizes the provider HTTP rate-limit response", () => {
    expect(isAuthRateLimitFailure({ status: 429 })).toBe(true);
  });

  it("does not classify other provider failures as rate limits", () => {
    expect(isAuthRateLimitFailure({ status: 400 })).toBe(false);
    expect(isAuthRateLimitFailure({})).toBe(false);
  });
});
