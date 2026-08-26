// @ts-check

import { pathToFileURL } from "node:url";

const managementApiOrigin = "https://api.supabase.com";
const beforeUserCreatedHookUri =
  "pg-functions://postgres/private/before_user_created";
const managementApiTimeoutMs = 15_000;
const supportedProjectRefs = new Set([
  "tutadgptycduscmezbeg",
  "tsbrhpyhseqhsdroszqu",
]);

/**
 * @typedef {Record<string, unknown>} HostedAuthConfig
 * @typedef {{ actual: unknown, expected: unknown, name: string, passed: boolean }} HostedAuthCheck
 * @typedef {{ checks: HostedAuthCheck[], passed: boolean }} HostedAuthInspection
 */

/**
 * @param {string} name
 * @param {unknown} actual
 * @param {unknown} expected
 * @returns {HostedAuthCheck}
 */
function check(name, actual, expected) {
  return {
    actual,
    expected,
    name,
    passed: Object.is(actual, expected),
  };
}

/**
 * @param {string} turnstileSecret
 */
export function buildHostedAuthPatch(turnstileSecret) {
  if (turnstileSecret.trim().length === 0) {
    throw new Error("SUPABASE_TURNSTILE_SECRET must not be empty.");
  }

  return {
    disable_signup: true,
    hook_before_user_created_enabled: true,
    hook_before_user_created_uri: beforeUserCreatedHookUri,
    security_captcha_enabled: true,
    security_captcha_provider: "turnstile",
    security_captcha_secret: turnstileSecret,
  };
}

/**
 * @param {HostedAuthConfig} config
 * @returns {HostedAuthInspection}
 */
export function inspectHostedAuthConfig(config) {
  const checks = [
    check("Public signup is disabled", config.disable_signup, true),
    check("Email login remains enabled", config.external_email_enabled, true),
    check(
      "Anonymous user creation is disabled",
      config.external_anonymous_users_enabled,
      false,
    ),
    check(
      "Before User Created hook is enabled",
      config.hook_before_user_created_enabled,
      true,
    ),
    check(
      "Before User Created hook targets the migrated function",
      config.hook_before_user_created_uri,
      beforeUserCreatedHookUri,
    ),
    check("CAPTCHA is enabled", config.security_captcha_enabled, true),
    check(
      "CAPTCHA provider is Turnstile",
      config.security_captcha_provider,
      "turnstile",
    ),
    check("Tenant email budget is 2 per hour", config.rate_limit_email_sent, 2),
    check(
      "Per-recipient email interval is 60 seconds",
      config.smtp_max_frequency,
      60,
    ),
    check("OTP request budget is 30 per hour", config.rate_limit_otp, 30),
    check(
      "OTP verification budget is 30 per 5 minutes",
      config.rate_limit_verify,
      30,
    ),
    check(
      "Token refresh budget is 150 per 5 minutes",
      config.rate_limit_token_refresh,
      150,
    ),
  ];

  return {
    checks,
    passed: checks.every((entry) => entry.passed),
  };
}

/**
 * @param {string} projectRef
 */
export function assertSupportedProjectRef(projectRef) {
  if (!supportedProjectRefs.has(projectRef)) {
    throw new Error(
      "Refusing to access hosted Auth: SUPABASE_PROJECT_REF is not a fixed Preview or Production target.",
    );
  }
}

/**
 * @param {string} projectRef
 * @param {string | undefined} confirmedProjectRef
 */
export function assertConfirmedProjectRef(projectRef, confirmedProjectRef) {
  if (!confirmedProjectRef || confirmedProjectRef !== projectRef) {
    throw new Error(
      "Refusing to mutate hosted Auth: SUPABASE_CONFIG_CONFIRM_REF must exactly match SUPABASE_PROJECT_REF.",
    );
  }
}

/**
 * @param {string} accessToken
 * @param {string} projectRef
 * @param {"GET" | "PATCH"} method
 * @param {ReturnType<typeof buildHostedAuthPatch>} [body]
 * @returns {Promise<HostedAuthConfig>}
 */
async function requestAuthConfig(accessToken, projectRef, method, body) {
  const response = await fetch(
    `${managementApiOrigin}/v1/projects/${encodeURIComponent(projectRef)}/config/auth`,
    {
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      method,
      signal: AbortSignal.timeout(managementApiTimeoutMs),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Supabase Management API ${method} failed with HTTP ${response.status}.`,
    );
  }

  return /** @type {Promise<HostedAuthConfig>} */ (response.json());
}

/**
 * @param {string} name
 */
function requireEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

/**
 * @param {string} projectRef
 * @param {HostedAuthInspection} inspection
 */
function printInspection(projectRef, inspection) {
  console.log(`Hosted Auth verification for ${projectRef}`);

  for (const entry of inspection.checks) {
    console.log(
      `${entry.passed ? "PASS" : "FAIL"} ${entry.name}` +
        (entry.passed
          ? ""
          : ` (expected ${String(entry.expected)}, received ${String(entry.actual)})`),
    );
  }
}

async function run() {
  const command = process.argv[2];

  if (command !== "verify" && command !== "apply") {
    throw new Error(
      "Usage: npm run hosted-auth -- <verify|apply>. See docs/deployment-runbook.md.",
    );
  }

  const accessToken = requireEnvironment("SUPABASE_ACCESS_TOKEN");
  const projectRef = requireEnvironment("SUPABASE_PROJECT_REF");
  assertSupportedProjectRef(projectRef);

  if (command === "apply") {
    assertConfirmedProjectRef(
      projectRef,
      process.env.SUPABASE_CONFIG_CONFIRM_REF?.trim(),
    );

    const turnstileSecret = requireEnvironment("SUPABASE_TURNSTILE_SECRET");
    await requestAuthConfig(
      accessToken,
      projectRef,
      "PATCH",
      buildHostedAuthPatch(turnstileSecret),
    );
  }

  const config = await requestAuthConfig(accessToken, projectRef, "GET");
  const inspection = inspectHostedAuthConfig(config);
  printInspection(projectRef, inspection);

  if (!inspection.passed) {
    process.exitCode = 1;
  }
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  run().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    process.exitCode = 1;
  });
}
