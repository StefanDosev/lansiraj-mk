import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServerClientMock, getClaimsMock } = vi.hoisted(() => ({
  createServerClientMock: vi.fn(),
  getClaimsMock: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

import { refreshSupabaseSession } from "@/lib/supabase/proxy";

describe("refreshSupabaseSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:55320";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
  });

  it("verifies claims and propagates refreshed cookies", async () => {
    createServerClientMock.mockImplementation((_url, _key, options) => {
      getClaimsMock.mockImplementation(async () => {
        options.cookies.setAll([
          {
            name: "sb-session",
            value: "refreshed",
            options: { httpOnly: true, path: "/", sameSite: "lax" },
          },
        ]);

        return { data: { claims: null }, error: null };
      });

      return { auth: { getClaims: getClaimsMock } };
    });

    const request = new NextRequest("http://localhost/app", {
      headers: { cookie: "existing=value" },
    });
    const response = await refreshSupabaseSession(request);

    expect(getClaimsMock).toHaveBeenCalledOnce();
    expect(request.cookies.get("sb-session")?.value).toBe("refreshed");
    expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
  });
});
