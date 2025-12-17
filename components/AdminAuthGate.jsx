"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "./AdminAuthProvider";

export default function AdminAuthGate({ children }) {
  const { supabase, session, loading, error, login, clearError } =
    useAdminAuth();
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    clearError();
    setMessage("");
    const ok = await login({ email, password });
    if (ok) {
      setMessage("Вход выполнен");
    }
  };

  if (!supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>Проверьте Supabase env переменные.</div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>Загрузка...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={`${styles.page} ${styles.loginPage}`}>
        <div className={styles.container}>
          <div className={`${styles.panel} ${styles.loginPanel}`}>
            <div className={styles.breadcrumbs}>
              <Link href="/">← На главную</Link>
            </div>
            <h1 className={styles.title}>Admin login</h1>
            <form onSubmit={handleLogin} className={styles.form}>
              <label className={styles.label}>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  className={styles.input}
                />
              </label>
              <button type="submit" className={styles.primaryBtn}>
                Войти
              </button>
            </form>
            {error && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.success}>{message}</div>}
          </div>
        </div>
      </main>
    );
  }

  return children;
}
