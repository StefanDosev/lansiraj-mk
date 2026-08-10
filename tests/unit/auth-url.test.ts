import { describe, expect, it } from "vitest";

import { resolveAppOrigin } from "@/features/auth/auth-url";

describe("resolveAppOrigin", () => {
  it("uses the configured canonical origin", () => {
    expect(
      resolveAppOrigin({
        nodeEnv: "production",
        siteUrl: "https://lansiraj.mk",
        vercelEnv: "production",
        vercelUrl: "lansiraj.vercel.app",
      }),
    ).toBe("https://lansiraj.mk");
  });

  it("prefers the stable Vercel branch origin for previews", () => {
    expect(
      resolveAppOrigin({
        nodeEnv: "production",
        siteUrl: "https://lansiraj.mk",
        vercelEnv: "preview",
        vercelBranchUrl: "lansiraj-git-feature.example.vercel.app",
        vercelUrl: "lansiraj-commit.example.vercel.app",
      }),
    ).toBe("https://lansiraj-git-feature.example.vercel.app");
  });

  it("falls back to the deployment origin for previews without a branch URL", () => {
    expect(
      resolveAppOrigin({
        nodeEnv: "production",
        siteUrl: "https://lansiraj.mk",
        vercelEnv: "preview",
        vercelUrl: "lansiraj-commit.example.vercel.app",
      }),
    ).toBe("https://lansiraj-commit.example.vercel.app");
  });

  it("uses the fixed local origin in development", () => {
    expect(
      resolveAppOrigin({ nodeEnv: "development", siteUrl: undefined, vercelEnv: undefined, vercelUrl: undefined }),
    ).toBe("http://127.0.0.1:3000");
  });

  it.each(["ftp://lansiraj.mk", "https://lansiraj.mk/path", "https://user:pass@lansiraj.mk"])(
    "rejects unsafe configured origins: %s",
    (siteUrl) => {
      expect(() =>
        resolveAppOrigin({ nodeEnv: "production", siteUrl, vercelEnv: "production", vercelUrl: undefined }),
      ).toThrow();
    },
  );
});
