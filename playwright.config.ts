import { defineConfig, devices } from "@playwright/test";

import { getLocalSupabaseEnvironment } from "@/tests/helpers/local-supabase";

const localSupabase = getLocalSupabaseEnvironment();
process.env.E2E_MAILPIT_URL = localSupabase.mailpitUrl;
process.env.E2E_SUPABASE_URL = localSupabase.apiUrl;
process.env.E2E_SUPABASE_PUBLISHABLE_KEY = localSupabase.publishableKey;
process.env.E2E_SUPABASE_SECRET_KEY = localSupabase.secretKey;

export function createPlaywrightConfig(webServerCommand: string) {
  return defineConfig({
    testDir: "./tests/e2e",
    outputDir: "test-results",
    reporter: "list",
    use: {
      baseURL: "http://127.0.0.1:3000",
      screenshot: "only-on-failure",
      trace: "retain-on-failure",
    },
    webServer: {
      command: webServerCommand,
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
        NEXT_PUBLIC_SUPABASE_URL: localSupabase.apiUrl,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: localSupabase.publishableKey,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
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
        name: "tablet-768",
        use: {
          ...devices["Desktop Chrome"],
          viewport: { width: 768, height: 1024 },
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
}

export default createPlaywrightConfig("npm run dev -- --hostname 127.0.0.1");
