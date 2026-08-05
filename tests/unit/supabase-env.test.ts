import { describe, expect, it } from "vitest";

import { validateSupabaseEnvironment } from "@/lib/supabase/env";

describe("validateSupabaseEnvironment", () => {
  it("returns valid browser-safe configuration", () => {
    expect(
      validateSupabaseEnvironment({
        url: "http://127.0.0.1:55320",
        publishableKey: "test-publishable-key",
      }),
    ).toEqual({
      url: "http://127.0.0.1:55320",
      publishableKey: "test-publishable-key",
    });
  });

  it.each([
    [{ publishableKey: "test-publishable-key", url: undefined }, "Missing NEXT_PUBLIC_SUPABASE_URL."],
    [{ publishableKey: undefined, url: "http://127.0.0.1:55320" }, "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."],
    [{ publishableKey: "test-publishable-key", url: "not-a-url" }, "NEXT_PUBLIC_SUPABASE_URL must be a valid URL."],
  ])("rejects invalid configuration", (environment, message) => {
    expect(() => validateSupabaseEnvironment(environment)).toThrow(message);
  });
});
