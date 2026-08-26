import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
  { path: "/", title: "Лансирај" },
  { path: "/privacy", title: "Приватност | Лансирај" },
  { path: "/auth/sign-in", title: "Најава | Лансирај" },
] as const;
const macedonianGlyphs = "Ѓ ѓ Ќ ќ Ѕ ѕ Љ љ Њ њ Џ џ — „“ 0123456789";

async function expectVisibleFocusRing(locator: Locator) {
  const focusStyle = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });

  expect(
    focusStyle.outlineStyle !== "none" && focusStyle.outlineWidth >= 3
      || focusStyle.boxShadow !== "none",
  ).toBe(true);
}

async function expectMinimumInteractiveTargets(page: Page) {
  const undersized = await page.locator(
    'a:visible, button:visible:not([aria-label="Open Next.js Dev Tools"]), input:visible, summary:visible',
  ).evaluateAll((elements) =>
    elements.flatMap((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.width >= 44 && bounds.height >= 44
        ? []
        : [{
            height: Math.round(bounds.height * 10) / 10,
            label: element.getAttribute("aria-label") ?? element.textContent?.trim().slice(0, 80) ?? element.tagName,
            tag: element.tagName,
            width: Math.round(bounds.width * 10) / 10,
          }];
    }),
  );

  expect(undersized).toEqual([]);
}

for (const route of routes) {
  test(`${route.path} renders its shell without horizontal overflow`, async ({ page }, testInfo) => {
    await page.goto(route.path);

    await expect(page.locator("html")).toHaveAttribute("lang", "mk");
    await expect(page).toHaveTitle(route.title);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

    const fontsSupportMacedonian = await page.evaluate(async (glyphs) => {
      await document.fonts.ready;
      const loadedFaces = await Promise.all([
        document.fonts.load('400 16px "Onest"', glyphs),
        document.fonts.load('600 16px "Onest"', glyphs),
        document.fonts.load('600 16px "Unbounded"', glyphs),
      ]);
      return {
        body: document.fonts.check('16px "Onest"', glyphs),
        display: document.fonts.check('16px "Unbounded"', glyphs),
        loaded: loadedFaces.every((faces) => faces.length > 0),
      };
    }, macedonianGlyphs);
    expect(fontsSupportMacedonian).toEqual({ body: true, display: true, loaded: true });

    if (testInfo.project.name !== "reduced-motion") {
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath("shell.png"),
      });
    }
  });
}

test("public and sign-in controls keep 44px touch targets", async ({ page }) => {
  await page.goto("/");
  await expectMinimumInteractiveTargets(page);

  await page.goto("/privacy");
  await expectMinimumInteractiveTargets(page);

  await page.goto("/auth/sign-in");
  await expectMinimumInteractiveTargets(page);
});

test("keyboard focus follows the sign-in reading order with a visible ring", async ({ page }) => {
  await page.goto("/auth/sign-in");

  const firstPartyBeforeChallenge = [
    page.getByRole("link", { name: "Прескокни до содржината" }),
    page.getByRole("link", { name: "Лансирај — почетна страница" }),
    page.getByLabel("Email адреса"),
  ];
  const submitButton = page.getByRole("button", { name: "Испрати magic link" });
  const privacyLink = page.getByRole("link", { name: "известувањето за приватност" });

  for (const control of firstPartyBeforeChallenge) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    await expectVisibleFocusRing(control);
  }

  await expect(submitButton).toBeEnabled({ timeout: 15_000 });
  await expect
    .poll(() => page.frames().some((frame) => frame.url().startsWith("https://challenges.cloudflare.com/")))
    .toBe(true);

  let reachedSubmit = false;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.keyboard.press("Tab");
    reachedSubmit = await submitButton.evaluate((element) => document.activeElement === element);
    if (reachedSubmit) break;
    await expect(privacyLink).not.toBeFocused();
  }

  expect(reachedSubmit).toBe(true);
  await expectVisibleFocusRing(submitButton);
  await page.keyboard.press("Tab");
  await expect(privacyLink).toBeFocused();
  await expectVisibleFocusRing(privacyLink);
});

test("privacy notice exposes the controller, retention, rights, and contact", async ({ page }) => {
  await page.goto("/privacy");

  await expect(page.getByRole("heading", { name: "Кој ги контролира податоците" })).toBeVisible();
  await expect(page.getByText("Стефан Досев е контролор", { exact: false })).toBeVisible();
  await expect(page.getByText("90 дена", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: "privacy@lansiraj.mk", exact: true }).first()).toHaveAttribute(
    "href",
    "mailto:privacy@lansiraj.mk",
  );
  await expect(page.getByRole("link", { name: /АЗЛП/ })).toHaveAttribute("href", "https://azlp.mk/");
});

test("unknown public routes show a branded context-neutral 404", async ({ page }) => {
  await page.goto("/route-that-does-not-exist");

  await expect(page).toHaveTitle("Страницата не е пронајдена | Лансирај");
  await expect(page.getByRole("heading", { name: "Оваа адреса не води до достапна страница." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Кон почетната страница" })).toHaveAttribute("href", "/");
});

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

  const reducedState = await page.evaluate(() => {
    const heroCopy = document.querySelector<HTMLElement>("[data-hero-copy]");
    const heroMedia = document.querySelector<HTMLElement>("[data-hero-media]");
    const revealItem = document.querySelector<HTMLElement>("[data-reveal] .reveal-item");
    return {
      heroClip: heroMedia ? getComputedStyle(heroMedia).clipPath : null,
      heroTransform: heroCopy ? getComputedStyle(heroCopy).transform : null,
      revealOpacity: revealItem ? getComputedStyle(revealItem).opacity : null,
      revealTransform: revealItem ? getComputedStyle(revealItem).transform : null,
    };
  });

  expect(reducedState.heroClip).not.toContain("64%");
  expect(reducedState.heroTransform).toBe("none");
  expect(reducedState.revealOpacity).toBe("1");
  expect(reducedState.revealTransform).toBe("none");
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
      ["primary on page", contrast(token("--text-primary"), token("--surface-page"))],
      ["secondary on page", contrast(token("--text-secondary"), token("--surface-page"))],
      ["muted on page", contrast(token("--text-muted"), token("--surface-page"))],
      ["primary on card", contrast(token("--text-primary"), token("--surface-card"))],
      ["active on page", contrast(token("--action-active"), token("--surface-page"))],
      ["inverse on ink", contrast(token("--text-inverse"), token("--surface-inverse"))],
      ["inverse on cobalt", contrast(token("--text-inverse"), token("--state-submitted"))],
      ["ink on launch", contrast(token("--text-primary"), token("--action-primary"))],
      ["ink on revision", contrast(token("--text-primary"), token("--state-revision"))],
      ["ink on approved", contrast(token("--text-primary"), token("--state-approved"))],
    ];
  });

  for (const [label, ratio] of contrastRatios) {
    expect(ratio, label as string).toBeGreaterThanOrEqual(4.5);
  }
});
