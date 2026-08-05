import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { describe, expect, it } from "vitest";

import { config } from "@/proxy";

describe("Supabase session proxy matcher", () => {
  it.each(["/", "/auth/sign-in", "/app", "/admin", "/api/example"])(
    "refreshes application request %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(true);
    },
  );

  it.each([
    "/_next/static/chunk.js",
    "/_next/image?url=%2Flogo.png",
    "/favicon.ico",
    "/sitemap.xml",
    "/robots.txt",
    "/brand/logo.svg",
  ])("skips static request %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url })).toBe(false);
  });
});
