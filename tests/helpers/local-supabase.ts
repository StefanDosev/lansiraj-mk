import { execFileSync } from "node:child_process";
import { join } from "node:path";

type LocalSupabaseEnvironment = {
  apiUrl: string;
  mailpitUrl: string;
  publishableKey: string;
  secretKey: string;
};

function getCliEntryPoint() {
  return join(process.cwd(), "node_modules", "supabase", "dist", "supabase.js");
}

export function getLocalSupabaseEnvironment(): LocalSupabaseEnvironment {
  const output = execFileSync(process.execPath, [getCliEntryPoint(), "status", "-o", "env"], {
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
  const apiUrl = values.API_URL;
  const publishableKey = values.PUBLISHABLE_KEY ?? values.ANON_KEY;
  const secretKey = values.SECRET_KEY ?? values.SERVICE_ROLE_KEY;
  const mailpitUrl = values.MAILPIT_URL;

  if (!apiUrl || !publishableKey || !secretKey || !mailpitUrl) {
    throw new Error("The local Supabase stack is missing required test endpoints. Run `npx supabase start` first.");
  }

  return { apiUrl, mailpitUrl, publishableKey, secretKey };
}

export function runLocalSql(sql: string) {
  execFileSync(process.execPath, [getCliEntryPoint(), "db", "query", "--local", sql], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
  });
}
