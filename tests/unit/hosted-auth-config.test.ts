import { describe, expect, it } from "vitest";

import {
  assertConfirmedProjectRef,
  assertSupportedProjectRef,
  buildHostedAuthPatch,
  inspectHostedAuthConfig,
} from "@/scripts/hosted-auth-config.mjs";

const expectedConfig = {
  disable_signup: true,
  external_anonymous_users_enabled: false,
  external_email_enabled: true,
  hook_before_user_created_enabled: true,
  hook_before_user_created_uri:
    "pg-functions://postgres/private/before_user_created",
  rate_limit_email_sent: 2,
  rate_limit_otp: 30,
  rate_limit_token_refresh: 150,
  rate_limit_verify: 30,
  security_captcha_enabled: true,
  security_captcha_provider: "turnstile",
  smtp_max_frequency: 60,
};

describe("hosted Auth configuration", () => {
  it("builds a bounded patch without unrelated hosted Auth settings", () => {
    expect(buildHostedAuthPatch("turnstile-secret")).toEqual({
      disable_signup: true,
      hook_before_user_created_enabled: true,
      hook_before_user_created_uri:
        "pg-functions://postgres/private/before_user_created",
      security_captcha_enabled: true,
      security_captcha_provider: "turnstile",
      security_captcha_secret: "turnstile-secret",
    });
  });

  it("accepts the documented invite-only boundary and rate budgets", () => {
    const inspection = inspectHostedAuthConfig(expectedConfig);

    expect(inspection.passed).toBe(true);
    expect(inspection.checks.every((entry) => entry.passed)).toBe(true);
  });

  it("reports drift without exposing a CAPTCHA secret", () => {
    const inspection = inspectHostedAuthConfig({
      ...expectedConfig,
      disable_signup: false,
      security_captcha_enabled: false,
    });

    expect(inspection.passed).toBe(false);
    expect(
      inspection.checks
        .filter((entry) => !entry.passed)
        .map((entry) => entry.name),
    ).toEqual(["Public signup is disabled", "CAPTCHA is enabled"]);
    expect(JSON.stringify(inspection)).not.toContain("secret");
  });

  it("requires an exact project-ref confirmation before mutation", () => {
    expect(() => assertConfirmedProjectRef("preview-ref", undefined)).toThrow(
      /must exactly match/,
    );
    expect(() =>
      assertConfirmedProjectRef("preview-ref", "production-ref"),
    ).toThrow(/must exactly match/);
    expect(() =>
      assertConfirmedProjectRef("preview-ref", "preview-ref"),
    ).not.toThrow();
  });

  it("allows only the fixed Preview and Production projects", () => {
    expect(() => assertSupportedProjectRef("tutadgptycduscmezbeg")).not.toThrow();
    expect(() => assertSupportedProjectRef("tsbrhpyhseqhsdroszqu")).not.toThrow();
    expect(() => assertSupportedProjectRef("wrong-project-ref")).toThrow(
      /not a fixed Preview or Production target/,
    );
  });
});
