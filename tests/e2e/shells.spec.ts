import { expect, test } from "@playwright/test";

const routes = ["/", "/auth/sign-in"];
const macedonianGlyphs = "ЃѓЌќЅѕЉљЊњЏџ";

for (const route of routes) {
  test(`${route} renders its shell without horizontal overflow`, async ({ page }, testInfo) => {
    await page.goto(route);

    await expect(page.locator("html")).toHaveAttribute("lang", "mk");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    const fontsSupportMacedonian = await page.evaluate(async (glyphs) => {
      await document.fonts.ready;
      return {
        body: document.fonts.check('16px "Onest"', glyphs),
        display: document.fonts.check('16px "Unbounded"', glyphs),
      };
    }, macedonianGlyphs);
    expect(fontsSupportMacedonian).toEqual({ body: true, display: true });

    if (testInfo.project.name !== "reduced-motion") {
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath("shell.png"),
      });
    }
  });
}

for (const route of ["/app", "/app/project", "/app/onboarding", "/admin", "/access-pending"]) {
  test(`${route} redirects an unauthenticated visitor to sign in`, async ({ page }) => {
    await page.goto(route);
    await expect(page).toHaveURL(/\/auth\/sign-in$/);
    await expect(page.getByRole("heading", { name: "Најави се во Лансирај" })).toBeVisible();
  });
}

test("skip link becomes visible and moves focus to main content", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Прескокни до содржината" });

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await skipLink.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("reduced motion collapses transitions and animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const motion = await page.getByRole("link", { name: "Пријави се за beta" }).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animationDuration: style.animationDuration,
      transitionDuration: style.transitionDuration,
    };
  });

  expect(Number.parseFloat(motion.animationDuration)).toBeLessThanOrEqual(0.00001);
  expect(Number.parseFloat(motion.transitionDuration)).toBeLessThanOrEqual(0.00001);
});

test("semantic text and surface tokens meet WCAG AA contrast", async ({ page }) => {
  await page.goto("/");
  const contrastRatios = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const token = (name: string) => root.getPropertyValue(name).trim();
    const parseRgb = (value: string) => {
      const probe = document.createElement("span");
      probe.style.color = value;
      document.body.append(probe);
      const channels = getComputedStyle(probe).color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      probe.remove();
      if (!channels || channels.length !== 3) throw new Error(`Unable to parse color token ${value}`);
      return channels;
    };
    const luminance = (value: string) => {
      const channels = parseRgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const contrast = (foreground: string, background: string) => {
      const lighter = Math.max(luminance(foreground), luminance(background));
      const darker = Math.min(luminance(foreground), luminance(background));
      return (lighter + 0.05) / (darker + 0.05);
    };

    return [
      contrast(token("--text-primary"), token("--surface-page")),
      contrast(token("--text-secondary"), token("--surface-page")),
      contrast(token("--action-active"), token("--surface-page")),
      contrast(token("--text-inverse"), token("--surface-inverse")),
      contrast(token("--state-approved"), token("--surface-inverse")),
    ];
  });

  for (const ratio of contrastRatios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
