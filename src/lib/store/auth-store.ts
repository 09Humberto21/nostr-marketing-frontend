import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthCompanyOut, AuthUserOut } from "@/lib/types/api";

/**
 * Global auth/session state.
 *
 * Only the JWT is persisted (localStorage). The user/company profile is
 * re-fetched from `GET /auth/me` on load so it never goes stale. `hasHydrated`
 * lets route guards wait for persisted state before deciding to redirect,
 * which prevents an authenticated → login flash on refresh.
 */
interface AuthState {
  token: string | null;
  user: AuthUserOut | null;
  company: AuthCompanyOut | null;
  hasHydrated: boolean;

  setToken: (token: string | null) => void;
  setSession: (user: AuthUserOut, company: AuthCompanyOut | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

/** SSR-safe no-op storage; the real localStorage is used in the browser. */
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      company: null,
      hasHydrated: false,

      setToken: (token) => set({ token }),
      setSession: (user, company) => set({ user, company }),
      logout: () => set({ token: null, user: null, company: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "ngx.auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage
      ),
      // Persist only the token; profile data is hydrated from the API.
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Imperative token accessor for non-React code (Axios interceptors). */
export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

export function clearAuth(): void {
  useAuthStore.getState().logout();
}
