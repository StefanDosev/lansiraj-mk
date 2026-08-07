import { defineConfig, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

function getLocalSupabaseEnvironment() {
  const cliEntryPoint = join(process.cwd(), "node_modules", "supabase", "dist", "supabase.js");
  const output = execFileSync(process.execPath, [cliEntryPoint, "status", "-o", "env"], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
  });
  const values = Object.fromEntries(
    output
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z_]+)="(.*)"$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => [match[1], match[2]]),
  );

  if (!values.API_URL || !values.PUBLISHABLE_KEY || !values.MAILPIT_URL) {
    throw new Error("The local Supabase stack is missing required E2E endpoints. Run `npx supabase start` first.");
  }

  return values as Record<"API_URL" | "PUBLISHABLE_KEY" | "MAILPIT_URL", string>;
}

const localSupabase = getLocalSupabaseEnvironment();
process.env.E2E_MAILPIT_URL = localSupabase.MAILPIT_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm.cmd run dev -- --hostname 127.0.0.1",
    env: {
      ...process.env,
      NEXT_PUBLIC_SUPABASE_URL: localSupabase.API_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: localSupabase.PUBLISHABLE_KEY,
    },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "mobile-360",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "reduced-motion",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 360, height: 800 },
      },
    },
  ],
});
