"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminDict, useAdminLocale } from "@/components/AdminLocaleProvider";
import { adminLanguages } from "@/lib/admin/i18n";
import { useAdminAuth } from "@/components/AdminAuthProvider";

export default function SettingsPage() {
  const dict = useAdminDict();
  const { language, setLanguage } = useAdminLocale();
  const { session, supabase } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const token = session?.access_token || "";
  const isSuperAdmin =
    (session?.user?.email || "").toLowerCase() === "syndicatetradefx@gmail.com";

  const fetchUsers = async () => {
    if (!token || !isSuperAdmin) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }
    setLoadingUsers(true);
    setUserError("");
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || dict.settings.usersLoadError);
      }
      setUsers(data.users || []);
    } catch (err) {
      setUserError(err.message || dict.settings.usersLoadError);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, isSuperAdmin]);

  const createUser = async (event) => {
    event.preventDefault();
    if (!token || !isSuperAdmin) return;
    setCreating(true);
    setUserError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || dict.settings.usersCreateError);
      }
      setForm({ email: "", password: "" });
      await fetchUsers();
    } catch (err) {
      setUserError(err.message || dict.settings.usersCreateError);
    } finally {
      setCreating(false);
    }
  };

  const deleteUser = async (user) => {
    if (!token || !isSuperAdmin) return;
    if (user?.is_superadmin) {
      setUserError(dict.settings.usersCannotDelete);
      return;
    }
    const confirmed = confirm(dict.settings.usersDeleteConfirm);
    if (!confirmed) return;
    setUserError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || dict.settings.usersDeleteError);
      }
      await fetchUsers();
    } catch (err) {
      setUserError(err.message || dict.settings.usersDeleteError);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (!supabase || !session?.user?.email) return;
    setPasswordError("");
    setPasswordMessage("");
    const { oldPassword, newPassword, confirmPassword } = passwordForm;
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError(dict.settings.passwordMismatch);
      return;
    }
    setPasswordSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: oldPassword,
      });
      if (signInError) {
        throw new Error(signInError.message);
      }
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        throw new Error(updateError.message);
      }
      setPasswordMessage(dict.settings.passwordChanged);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message || dict.settings.passwordChange);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>{dict.settings.kicker}</div>
            <div className={styles.heading} lang="en" translate="no">Interface</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">{dict.common.backSections}</Link>
            </div>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.kicker}>{dict.settings.langTitle}</div>
          <p className={styles.muted}>{dict.settings.langDesc}</p>
          <div className={styles.actions} style={{ marginTop: 12 }}>
            {adminLanguages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={
                  language === l.code ? styles.primaryBtn : styles.secondaryBtn
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.kicker}>{dict.settings.passwordTitle}</div>
          <p className={styles.muted}>{dict.settings.passwordDesc}</p>
          <form onSubmit={changePassword} className={styles.form}>
            <label className={styles.label}>
              {dict.settings.passwordOld}
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                }
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              {dict.settings.passwordNew}
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className={styles.input}
                required
              />
            </label>
            <label className={styles.label}>
              {dict.settings.passwordConfirm}
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className={styles.input}
                required
              />
            </label>
            <button type="submit" className={styles.primaryBtn} disabled={passwordSaving}>
              {passwordSaving ? dict.common.saving : dict.settings.passwordChange}
            </button>
          </form>
          {passwordError && <div className={styles.error}>{passwordError}</div>}
          {passwordMessage && <div className={styles.success}>{passwordMessage}</div>}
        </section>

        {isSuperAdmin && (
          <section className={styles.panel}>
            <div className={styles.kicker}>{dict.settings.usersTitle}</div>
            <p className={styles.muted}>{dict.settings.usersDesc}</p>
            <form onSubmit={createUser} className={styles.form}>
              <label className={styles.label}>
                {dict.settings.usersEmail}
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className={styles.input}
                  required
                />
              </label>
              <label className={styles.label}>
                {dict.settings.usersPassword}
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className={styles.input}
                  required
                />
              </label>
              <button type="submit" className={styles.primaryBtn} disabled={creating}>
                {creating ? dict.common.saving : dict.settings.usersAdd}
              </button>
            </form>

            {loadingUsers ? (
              <div className={styles.muted}>{dict.common.loading}</div>
            ) : (
              <div className={styles.itemsGrid}>
                {users.map((user) => (
                  <div key={user.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>
                        {user.is_superadmin ? dict.settings.usersSuperadmin : "Admin"}
                      </div>
                      <div className={styles.muted}>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                    <div className={styles.label}>
                      <strong>{user.email}</strong>
                    </div>
                    {!user.is_superadmin && (
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => deleteUser(user)}
                          className={`${styles.linkBtn} ${styles.noLeftPadding}`}
                        >
                          {dict.settings.usersDelete}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {userError && <div className={styles.error}>{userError}</div>}
          </section>
        )}

        <section className={styles.panel}>
          <div className={styles.muted}>{dict.settings.comingSoon}</div>
        </section>
      </div>
    </main>
  );
}
