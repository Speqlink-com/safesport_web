"use client";

import { useEffect } from "react";
import { authApi } from "../api";
import { useAuthStore } from "../store";

export function AuthBootstrap() {
  const authInitialized = useAuthStore((state) => state.authInitialized);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (authInitialized) return;
    let active = true;
    const initialize = async () => {
      try {
        const session = await authApi.me();
        if (active) setSession(session.user);
      } catch {
        try {
          const session = await authApi.refresh();
          if (active) setSession(session.user);
        } catch {
          if (active) clearSession();
        }
      }
    };
    void initialize();
    return () => {
      active = false;
    };
  }, [authInitialized, clearSession, setSession]);

  return null;
}

