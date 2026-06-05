"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getMe, login, register } from "@/lib/api/auth";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/lib/store/auth-store";
import type { LoginRequest, RegisterRequest } from "@/lib/types/api";

/**
 * Fetches the authenticated profile when a token exists and mirrors it into the
 * Zustand store (so the sidebar/topbar can read it synchronously).
 */
export function useMe() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const me = await getMe();
      setSession(me.user, me.company);
      return me;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: async (data) => {
      setToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.replace("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((s) => s.setToken);

  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
    onSuccess: async (data) => {
      setToken(data.access_token);
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
      router.replace("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return () => {
    logout();
    queryClient.clear();
    router.replace("/login");
  };
}
