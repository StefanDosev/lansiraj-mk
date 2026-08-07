import { expect, test } from "@playwright/test";

test("authenticated outsider receives neutral pending access and can sign out", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "One deterministic local email flow is sufficient.");

  const mailpitUrl = process.env.E2E_MAILPIT_URL;
  expect(mailpitUrl, "Playwright must expose the local Mailpit URL").toBeTruthy();
  const email = `outsider-${Date.now()}@gmail.com`;
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
  await expect(page).toHaveURL(/\/access-pending$/);
  await expect(page.getByRole("heading", { name: "Сè уште немаш активна покана" })).toBeVisible();

  await page.getByRole("button", { name: "Одјави се" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
});

test("invalid callback returns a neutral retry state", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/\/auth\/sign-in\?status=callback-error$/);
  await expect(page.getByRole("alert").filter({ hasText: "Линкот не може да се потврди" })).toBeVisible();
});
