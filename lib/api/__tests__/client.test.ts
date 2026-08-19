import { describe, it, expect, beforeEach, vi } from "vitest";

// performRefresh và token module bị mock để cô lập hành vi của client.ts —
// flow refresh thật đã có refresh.test.ts riêng.
vi.mock("../refresh", () => ({ performRefresh: vi.fn() }));
vi.mock("../auth-init", () => ({ waitForAuthInit: vi.fn().mockResolvedValue(undefined) }));

import apiRequest from "../client";
import { setAccessToken } from "../token";
import { performRefresh } from "../refresh";
import { ApiError } from "../errors";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest (lib/api/client)", () => {
  beforeEach(() => {
    setAccessToken(null);
    vi.restoreAllMocks();
    // vi.restoreAllMocks() chỉ khôi phục implementation gốc của spy tạo bằng
    // vi.spyOn; performRefresh là vi.fn() tạo trong factory vi.mock() nên lịch sử
    // gọi (call count) của nó vẫn tồn tại giữa các test nếu không clear riêng.
    vi.mocked(performRefresh).mockReset();
  });

  it("attaches the Authorization header when an access token is set", async () => {
    setAccessToken("abc123");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: { ok: true } }));

    await apiRequest.get("/ping");

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer abc123");
  });

  it("does not attach Authorization when noAuth is true, even with a token set", async () => {
    setAccessToken("abc123");
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: {} }));

    await apiRequest.get("/public", { noAuth: true });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("always sends credentials: 'include' so the httpOnly refresh cookie travels with the request", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ data: {} }));
    await apiRequest.get("/whatever", { noAuth: true });
    const [, init] = fetchSpy.mock.calls[0];
    expect(init?.credentials).toBe("include");
  });

  it("on 401, calls performRefresh exactly once and retries the original request with the new token", async () => {
    vi.mocked(performRefresh).mockImplementation(async () => {
      setAccessToken("new-token");
      return true;
    });

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(jsonResponse({ message: "Unauthorized" }, 401))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }, 200));

    setAccessToken("expired-token");
    const result = await apiRequest.get<{ ok: boolean }>("/secure");

    expect(performRefresh).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const secondCallHeaders = fetchSpy.mock.calls[1][1]?.headers as Record<string, string>;
    expect(secondCallHeaders.Authorization).toBe("Bearer new-token");
    // request() trả nguyên body đã parse JSON, không tự unwrap field "data" —
    // việc unwrap là trách nhiệm của caller (vd. AuthContext dùng ApiResponse<T>).
    expect(result).toEqual({ data: { ok: true } });
  });

  it("throws ApiError and does NOT retry when refresh fails after a 401", async () => {
    vi.mocked(performRefresh).mockResolvedValue(false);
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));

    await expect(apiRequest.get("/secure")).rejects.toBeInstanceOf(ApiError);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("throws ApiError immediately on 401 without refresh when noRedirectOn401 is set", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));

    await expect(apiRequest.get("/secure", { noRedirectOn401: true })).rejects.toBeInstanceOf(ApiError);
    expect(performRefresh).not.toHaveBeenCalled();
  });

  it("postSafe returns a SafeResponse instead of throwing on API errors", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ message: "Bad input" }, 400));

    const result = await apiRequest.postSafe("/orders", { qty: -1 });

    expect(result.success).toBe(false);
    expect(result.error?.status).toBe(400);
    expect(result.error?.message).toBe("Bad input");
  });

  it("wraps network failures (TypeError from fetch) into a friendly Vietnamese message", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(apiRequest.get("/ping")).rejects.toThrow("Không thể kết nối đến server");
  });
});
