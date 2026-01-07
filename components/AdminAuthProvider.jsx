"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AdminAuthContext = createContext({
  supabase: null,
  session: null,
  loading: true,
  error: "",
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export function AdminAuthProvider({ children }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError("Supabase env vars не заданы");
      setLoading(false);
      return;
    }

    // Получаем текущую сессию
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("[AdminAuth] getSession error:", error);
        setError(error.message);
      }
      setSession(data.session);
      setLoading(false);
    });

    // Слушаем изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("[AdminAuth] auth state changed:", event, {
        hasSession: !!newSession,
        expiresAt: newSession?.expires_at,
        userId: newSession?.user?.id,
      });

      // Обрабатываем разные события
      if (event === "SIGNED_OUT") {
        console.log("[AdminAuth] User signed out");
        setSession(null);
        return;
      }

      if (event === "TOKEN_REFRESHED") {
        console.log("[AdminAuth] Token refreshed");
        setSession(newSession);
        return;
      }

      if (event === "SIGNED_IN") {
        console.log("[AdminAuth] User signed in");
        setSession(newSession);
        return;
      }

      if (event === "USER_UPDATED") {
        console.log("[AdminAuth] User updated");
        setSession(newSession);
        return;
      }

      // Для всех остальных событий обновляем сессию
      setSession(newSession);

      // Если сессия есть, проверяем срок действия токена
      if (newSession && newSession.expires_at) {
        const expiresAt = newSession.expires_at * 1000; // конвертируем в миллисекунды
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Если токен истекает в течение 5 минут, обновляем его заранее
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log(
            "[AdminAuth] Token expiring soon, refreshing...",
            Math.round(timeUntilExpiry / 1000),
            "seconds left"
          );
          try {
            const { data: refreshData, error: refreshError } =
              await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("[AdminAuth] Refresh error:", refreshError);
              // Если refresh token тоже истек, сессия будет null при следующем событии
            } else if (refreshData.session) {
              console.log("[AdminAuth] Token refreshed successfully");
              setSession(refreshData.session);
            }
          } catch (err) {
            console.error("[AdminAuth] Refresh exception:", err);
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async ({ email, password }) => {
    if (!supabase) return false;
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  const clearError = () => setError("");

  return (
    <AdminAuthContext.Provider
      value={{
        supabase,
        session,
        loading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
