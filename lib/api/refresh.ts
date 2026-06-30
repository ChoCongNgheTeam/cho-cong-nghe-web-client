import { API_BASE_URL } from "../../config/api.config";
import { setAccessToken } from "./token";

const BASE_URL = API_BASE_URL?.replace(/\/+$/, "");
const REFRESH_TIMEOUT_MS = 15000;
const MAX_REFRESH_RETRIES = 2;

let _refreshPromise: Promise<boolean> | null = null;

export const performRefresh = async (retryCount = 0): Promise<boolean> => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

      const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!refreshResponse.ok) return false;

      const data = await refreshResponse.json();
      const token = data?.data?.accessToken ?? data?.accessToken ?? null;
      if (!token) return false;

      setAccessToken(token);
      return true;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        console.warn(`[performRefresh] Timeout lần ${retryCount + 1}`);
        if (retryCount < MAX_REFRESH_RETRIES) {
          _refreshPromise = null;
          return performRefresh(retryCount + 1);
        }
        console.warn("[performRefresh] Hết retry, coi như fail");
      }
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
};
