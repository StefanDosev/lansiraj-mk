import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

function runLocalSql(sql: string) {
  const cliEntryPoint = join(process.cwd(), "node_modules", "supabase", "dist", "supabase.js");
  execFileSync(process.execPath, [cliEntryPoint, "db", "query", "--local", sql], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
  });
}

async function openLatestMagicLink(page: Page, request: APIRequestContext, email: string) {
  const mailpitUrl = process.env.E2E_MAILPIT_URL;
  expect(mailpitUrl, "Playwright must expose the local Mailpit URL").toBeTruthy();

  await page.goto("/auth/sign-in");
  await page.getByLabel("Email адреса").fill(email);
  await page.getByRole("button", { name: "Испрати magic link" }).click();
  await expect(page.getByText("Ако адресата може да се најави, ќе добиеш безбеден линк по email.")).toBeVisible();

  const query = encodeURIComponent(`to:${email}`);
  await expect
    .poll(
      async () => {
        const response = await request.get(`${mailpitUrl}/view/latest.html?query=${query}`);
        return response.ok() ? response.text() : "";
      },
      { timeout: 15_000 },
    )
    .toContain("href=");

  const message = await (await request.get(`${mailpitUrl}/view/latest.html?query=${query}`)).text();
  const link = message.match(/href="([^"]+)"/)?.[1]?.replaceAll("&amp;", "&");
  expect(link).toBeTruthy();
  await page.goto(link!);
}

test("authenticated outsider receives neutral pending access and can sign out", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One deterministic local email flow is sufficient.");

  const email = `outsider-${Date.now()}@gmail.com`;
  await openLatestMagicLink(page, request, email);
  await expect(page).toHaveURL(/\/access-pending$/);
  await expect(page.getByRole("heading", { name: "Сè уште немаш активна покана" })).toBeVisible();

  await page.getByRole("button", { name: "Одјави се" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
});

test("onboarding state guards direct learner navigation", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One deterministic local email flow is sufficient.");

  const supabaseUrl = process.env.E2E_SUPABASE_URL;
  const secretKey = process.env.E2E_SUPABASE_SECRET_KEY;
  expect(supabaseUrl).toBeTruthy();
  expect(secretKey).toBeTruthy();
  const admin = createClient(supabaseUrl!, secretKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const runId = `${Date.now()}-${testInfo.workerIndex}`;
  const cohortId = randomUUID();
  const reviewerEmail = `reviewer-${runId}@example.test`;
  const learnerEmail = `learner-${runId}@example.test`;

  const { data: reviewer, error: reviewerError } = await admin.auth.admin.createUser({
    email: reviewerEmail,
    email_confirm: true,
  });
  expect(reviewerError).toBeNull();
  expect(reviewer.user).toBeTruthy();

  try {
    runLocalSql(
      `insert into public.cohorts (id, name, status) values ('${cohortId}', 'E2E ${runId}', 'active')`,
    );
    runLocalSql(
      `insert into public.cohort_invites (cohort_id, email, expires_at, created_by) values ('${cohortId}', '${learnerEmail}', now() + interval '1 hour', '${reviewer.user!.id}')`,
    );

    await openLatestMagicLink(page, request, learnerEmail);
    await expect(page).toHaveURL(/\/app\/onboarding$/);

    await page.goto("/app");
    await expect(page).toHaveURL(/\/app\/onboarding$/);
    await page.goto("/app/project");
    await expect(page).toHaveURL(/\/app\/onboarding$/);

    const { data: users, error: usersError } = await admin.auth.admin.listUsers();
    expect(usersError).toBeNull();
    const learner = users.users.find((user) => user.email === learnerEmail);
    expect(learner).toBeTruthy();
    runLocalSql(
      `update public.profiles set onboarding_completed_at = now() where user_id = '${learner!.id}'`,
    );

    await page.goto("/app/onboarding");
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    runLocalSql(`delete from public.cohort_invites where cohort_id = '${cohortId}'`);
    runLocalSql(`delete from public.cohort_members where cohort_id = '${cohortId}'`);
    runLocalSql(`delete from public.cohorts where id = '${cohortId}'`);
    const { data: users } = await admin.auth.admin.listUsers();
    const learner = users.users.find((user) => user.email === learnerEmail);
    if (learner) await admin.auth.admin.deleteUser(learner.id);
    await admin.auth.admin.deleteUser(reviewer.user!.id);
  }
});

test("invalid token confirmation returns a neutral retry state", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=invalid&type=email");
  await expect(page).toHaveURL(/\/auth\/sign-in\?status=callback-error$/);
  await expect(page.getByRole("alert").filter({ hasText: "Линкот не може да се потврди" })).toBeVisible();
});

test("invalid code confirmation returns a neutral retry state", async ({ page }) => {
  await page.goto("/auth/confirm?code=invalid");
  await expect(page).toHaveURL(/\/auth\/sign-in\?status=callback-error$/);
  await expect(page.getByRole("alert").filter({ hasText: "Линкот не може да се потврди" })).toBeVisible();
});

test("invalid callback returns a neutral retry state", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/\/auth\/sign-in\?status=callback-error$/);
  await expect(page.getByRole("alert").filter({ hasText: "Линкот не може да се потврди" })).toBeVisible();
});
