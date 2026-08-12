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
  test.setTimeout(60_000);

  test.skip(testInfo.project.name === "reduced-motion", "Desktop and mobile cover this stateful email flow.");

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

    await page.getByLabel("Име за приказ").fill("Ана");
    await page.getByLabel("Работен наслов").fill("X");
    await page.getByRole("button", { name: "Зачувај и продолжи" }).click();
    const errorSummary = page.locator("#onboarding-error-summary");
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toBeFocused();
    await expect(page.getByLabel("Име за приказ")).toHaveValue("Ана");
    await expect(page.getByLabel("Работен наслов")).toHaveValue("X");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: testInfo.outputPath("onboarding-validation.png") });

    await page.getByLabel("Работен наслов").fill("Мал планер");
    await page.getByLabel("За кого е проектот?").fill("Студенти што учат самостојно");
    await page.getByLabel("Кој болен проблем го решава?").fill("Ги губат малите задачи и не знаат што е следно.");
    await page.getByLabel("Една главна акција").fill("Да ја означат следната важна задача.");
    await page.getByLabel("Што нема да градиш?").fill("Плаќања\nChat\nМобилна апликација");
    await page.getByLabel("Часови неделно").fill("5");
    await page.getByRole("button", { name: "Зачувај и продолжи" }).click();
    await expect(page).toHaveURL(/\/app$/);

    const { data: users, error: usersError } = await admin.auth.admin.listUsers();
    expect(usersError).toBeNull();
    const learner = users.users.find((user) => user.email === learnerEmail);
    expect(learner).toBeTruthy();
    const { data: projects, error: projectsError } = await admin
      .from("projects")
      .select("owner_id,title,status,non_features")
      .eq("owner_id", learner!.id);
    expect(projectsError).toBeNull();
    expect(projects).toEqual([{ owner_id: learner!.id, title: "Мал планер", status: "draft", non_features: ["Плаќања", "Chat", "Мобилна апликација"] }]);

    await expect(page.getByRole("heading", { name: "Мал планер" })).toBeVisible();
    await page.getByRole("button", { name: "Започни го проектот" }).click();
    await expect(page.getByRole("heading", { name: "Дефинирај еден корисник и еден болен проблем" })).toBeVisible();
    await expect(page.getByText("Подготвено за работа", { exact: true })).toBeVisible();
    await expect(page.getByText("0 од 10 задачи се одобрени")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Потребен доказ" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Последна повратна информација" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Точен услов за следниот чекор" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const { data: startedProjects, error: startedProjectsError } = await admin
      .from("projects")
      .select("id,status,curriculum_version")
      .eq("owner_id", learner!.id)
      .single();
    expect(startedProjectsError).toBeNull();
    expect(startedProjects).toMatchObject({ status: "active", curriculum_version: "v1" });

    const { data: projections, error: projectionsError } = await admin
      .from("project_assignments")
      .select("state,assignment:assignments(position)")
      .eq("project_id", startedProjects!.id);
    expect(projectionsError).toBeNull();
    expect(projections).toHaveLength(10);
    expect(projections!.filter((projection) => projection.state === "available")).toEqual([
      { state: "available", assignment: { position: 1 } },
    ]);
    expect(projections!.filter((projection) => projection.state === "locked")).toHaveLength(9);

    await page.goto("/app/assignments/target-user-and-problem");
    await expect(page.getByRole("heading", { name: "Дефинирај еден корисник и еден болен проблем" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Критериуми за прифаќање" })).toBeVisible();
    await expect(page.getByText("Подготвено за работа", { exact: true })).toBeVisible();
    await expect(page.getByRole("list").filter({ hasText: "Опишан е еден специфичен корисник" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.goto("/app/assignments/research-observations");
    await expect(page.getByRole("heading", { name: "Собери три интервјуа или набљудувања" })).toBeVisible();
    await expect(page.getByText("Заклучено", { exact: true })).toBeVisible();

    if (testInfo.project.name === "desktop") {
      const curriculumSlugs = [
        "target-user-and-problem",
        "research-observations",
        "one-page-mvp-brief",
        "main-flow-wireframe",
        "repository-architecture-preview",
        "core-feature-end-to-end",
        "mobile-critical-flow-qa",
        "real-user-testing",
        "public-launch-outreach",
        "reflection-case-study",
      ];

      for (const slug of curriculumSlugs) {
        await page.goto(`/app/assignments/${slug}`);
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Критериуми за прифаќање" })).toBeVisible();
      }
    }

    await page.goto("/app/assignments/not-a-curriculum-assignment");
    await expect(page.getByRole("heading", { name: "Нема задача на оваа адреса" })).toBeVisible();

    await page.goto("/app/project");
    await expect(page.getByRole("heading", { name: "Мал планер" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Сè уште нема проценка" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Од идеја до јавен производ" })).toBeVisible();
    await expect(page.getByRole("list", { name: "Шест фази на проектната патека" }).getByRole("listitem")).toHaveCount(6);
    await expect(page.getByText("Тековна задача · Подготвено за работа")).toBeVisible();
    await expect(page.getByText("0 од 10 задачи се одобрени")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Јавен URL на проектот" })).toBeVisible();
    await expect(page.getByLabel("Јавен URL на проектот").getByText("Се отклучува кога „Објави јавен URL и контактирај три лица“ ќе биде одобрено.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Собери три интервјуа или набљудувања" })).toHaveAttribute("href", "/app/assignments/research-observations");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await page.getByRole("button", { name: "Одјави се" }).click();
    runLocalSql(`insert into private.reviewer_roles (user_id) values ('${reviewer.user!.id}')`);
    await openLatestMagicLink(page, request, reviewerEmail);
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto(`/admin/projects/${startedProjects!.id}`);
    await expect(page.getByRole("heading", { name: "Мал планер" })).toBeVisible();
    await page.getByLabel("Потребно е намалување").check();
    await page.getByLabel("Белешка").fill("Намали ја главната акција на еден јасен исход.");
    await page.getByRole("button", { name: "Зачувај проценка" }).click();
    await expect(page.getByRole("status")).toContainText("Проценката е зачувана");

    const { data: assessments, error: assessmentsError } = await admin
      .from("project_scope_assessments")
      .select("readiness,note,reviewed_by")
      .eq("project_id", startedProjects!.id);
    expect(assessmentsError).toBeNull();
    expect(assessments).toEqual([{
      readiness: "needs_reduction",
      note: "Намали ја главната акција на еден јасен исход.",
      reviewed_by: reviewer.user!.id,
    }]);
    expect(projections!.filter((projection) => projection.state === "available")).toHaveLength(1);

    await page.goto("/app/onboarding");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  } finally {
    runLocalSql(`delete from public.projects where cohort_id = '${cohortId}'`);
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
