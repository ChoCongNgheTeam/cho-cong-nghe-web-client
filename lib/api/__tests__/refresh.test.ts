import { describe, it, expect, beforeEach, vi } from "vitest";
import { performRefresh } from "../refresh";
import { getAccessToken, setAccessToken } from "../token";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("performRefresh", () => {
  beforeEach(() => {
    setAccessToken(null);
    vi.restoreAllMocks();
  });

  it("sets the access token and returns true on a successful refresh", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: { accessToken: "tok-1" } }));

    const ok = await performRefresh();

    expect(ok).toBe(true);
    expect(getAccessToken()).toBe("tok-1");
  });

  it("accepts a flat { accessToken } shape as a fallback", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ accessToken: "tok-2" }));
    const ok = await performRefresh();
    expect(ok).toBe(true);
    expect(getAccessToken()).toBe("tok-2");
  });

  it("returns false and leaves the token unset when the server responds non-2xx", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ message: "No refresh cookie" }, 401));
    const ok = await performRefresh();
    expect(ok).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it("dedupes concurrent calls into a single in-flight request", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: { accessToken: "tok-3" } }));

    const [a, b, c] = await Promise.all([performRefresh(), performRefresh(), performRefresh()]);

    expect(a).toBe(true);
    expect(b).toBe(true);
    expect(c).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("calls credentials: 'include' so the httpOnly refresh cookie is sent", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: { accessToken: "tok-4" } }));
    await performRefresh();
    expect(fetchSpy.mock.calls[0][1]?.credentials).toBe("include");
  });
});
