"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

const pages = [
  { slug: "home", label: "Главная" },
];

export default function SeoPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [pageSlug, setPageSlug] = useState("home");
  const [form, setForm] = useState({
    meta_title: "",
    meta_description: "",
    meta_h1: "",
    canonical: "",
    og_image: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);
    setError("");
    setMessage("");

    supabase
      .from("pages")
      .select("meta_title, meta_description, meta_h1, canonical, og_image")
      .eq("slug", pageSlug)
      .eq("locale", locale)
      .eq("status", "published")
      .limit(1)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }
        const record = data?.[0];
        setForm({
          meta_title: record?.meta_title ?? "",
          meta_description: record?.meta_description ?? "",
          meta_h1: record?.meta_h1 ?? "",
          canonical: record?.canonical ?? "",
          og_image: record?.og_image ?? "",
        });
        setLoading(false);
      });
  }, [authLoading, locale, pageSlug, session, supabase]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const savePage = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { error: upsertError } = await supabase
      .from("pages")
      .upsert(
        {
          slug: pageSlug,
          locale,
          status: "published",
          meta_title: form.meta_title,
          meta_description: form.meta_description,
          meta_h1: form.meta_h1,
          canonical: form.canonical,
          og_image: form.og_image,
        },
        { onConflict: "slug,locale" }
      );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setMessage("Сохранено");
    }
    setSaving(false);
  };

  if (authLoading || !session || !supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>Загрузка...</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>SEO</div>
            <div className={styles.heading}>Meta настройки</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
            </div>
          </div>
          <div className={styles.actions}>
            <select
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              className={styles.select}
            >
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className={styles.select}
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <button onClick={savePage} className={styles.primaryBtn} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
            <button onClick={logout} className={styles.secondaryBtn}>
              Выйти
            </button>
          </div>
        </header>

        {loading ? (
          <div className={styles.panel}>Загрузка...</div>
        ) : (
          <section className={styles.panel}>
            <div className={styles.kicker}>Главная</div>
            <label className={styles.label}>
              Meta Title
              <input
                value={form.meta_title ?? ""}
                onChange={(e) => updateField("meta_title", e.target.value)}
                className={styles.input}
                maxLength={160}
                placeholder="до ~70 символов"
              />
            </label>
            <label className={styles.label}>
              Meta Description
              <textarea
                value={form.meta_description ?? ""}
                onChange={(e) => updateField("meta_description", e.target.value)}
                className={styles.input}
                rows={3}
                maxLength={320}
                placeholder="до ~160 символов"
              />
            </label>
            <label className={styles.label}>
              H1
              <input
                value={form.meta_h1 ?? ""}
                onChange={(e) => updateField("meta_h1", e.target.value)}
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              Canonical URL
              <input
                value={form.canonical ?? ""}
                onChange={(e) => updateField("canonical", e.target.value)}
                className={styles.input}
                placeholder="https://example.com/"
              />
            </label>
            <label className={styles.label}>
              OG image URL
              <input
                value={form.og_image ?? ""}
                onChange={(e) => updateField("og_image", e.target.value)}
                className={styles.input}
                placeholder="/og.png или https://..."
              />
            </label>
          </section>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
