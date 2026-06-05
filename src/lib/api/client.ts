import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { clearAuth, getAuthToken } from "@/lib/store/auth-store";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

/**
 * Shared Axios instance for the whole app.
 *
 * Request interceptor  → attaches the bearer JWT from the auth store.
 * Response interceptor → on 401 it clears the session and bounces the user to
 *                        the login page (once), so an expired token never traps
 *                        them in a broken authenticated shell.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let redirectingToLogin = false;

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";

    // Don't hijack the login/register flow — a 401 there is a credential error
    // the form should surface, not a session expiry.
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthEndpoint) {
      clearAuth();
      if (typeof window !== "undefined" && !redirectingToLogin) {
        redirectingToLogin = true;
        const next = encodeURIComponent(window.location.pathname);
        window.location.assign(`/login?session=expired&next=${next}`);
      }
    }

    return Promise.reject(error);
  }
);
