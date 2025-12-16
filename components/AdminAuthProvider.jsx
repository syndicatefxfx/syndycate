"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => setSession(newSession)
    );
    return () => {
      listener?.subscription.unsubscribe();
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
