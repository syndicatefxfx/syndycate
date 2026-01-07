"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";
import { useAdminLocale } from "@/components/AdminLocaleProvider";
import AdminTopBarActions from "@/components/AdminTopBarActions";
import { useToast } from "@/components/admin/ToastProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

const pages = [{ slug: "home", label: "Home" }];

export default function SeoPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { language } = useAdminLocale();
  const { showToast } = useToast();
  const t = (ru, en) => (language === "en" ? en : ru);
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;

    const fetchData = async () => {
      // Проверяем, не истек ли токен
      if (session.expires_at) {
        const expiresAt = session.expires_at * 1000;
        const now = Date.now();
        if (now >= expiresAt) {
          // Токен истек, пытаемся обновить
          const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            showToast("Session expired. Please login again.", "error");
            return;
          }
        }
      }

      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("pages")
        .select("meta_title, meta_description, meta_h1, canonical, og_image")
        .eq("slug", pageSlug)
        .eq("locale", locale)
        .eq("status", "published")
        .limit(1);

      if (fetchError) {
        // Если ошибка авторизации, не показываем toast
        if (fetchError.code === "PGRST301" || fetchError.message?.includes("JWT")) {
          console.error("[SEO] Auth error:", fetchError);
          setLoading(false);
          return;
        }
        showToast(fetchError.message, "error");
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
    };

    fetchData();
  }, [authLoading, locale, pageSlug, session, supabase]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const savePage = async () => {
    if (!supabase || !session) return;
    setSaving(true);

    const { error: upsertError } = await supabase.from("pages").upsert(
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
      showToast(upsertError.message, "error");
    } else {
      showToast(dict.common.saved, "success");
    }
    setSaving(false);
  };

  if (authLoading || !session || !supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>{dict.common.loading}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>SEO</div>
            <div className={styles.heading}>Meta settings</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">{dict.common.backSections}</Link>
            </div>
          </div>
          <AdminTopBarActions>
            <select
              value={pageSlug}
              onChange={(e) => setPageSlug(e.target.value)}
              className={styles.select}
            >
              {pages.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {typeof p.label === "string"
                    ? p.label
                    : language === "en"
                    ? p.label.en
                    : p.label.ru}
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
            <button
              onClick={savePage}
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? dict.common.saving : dict.common.save}
            </button>
          </AdminTopBarActions>
        </header>

        {loading ? (
          <section className={styles.panel}>
            <div className={styles.skeletonKicker}></div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonTextarea}></div>
            </div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonInput}></div>
            </div>
          </section>
        ) : (
          <section className={styles.panel}>
            <div className={styles.kicker}>{dict.seo.home}</div>
            <label className={styles.label}>
              {dict.seo.metaTitle}
              <input
                value={form.meta_title ?? ""}
                onChange={(e) => updateField("meta_title", e.target.value)}
                className={styles.input}
                maxLength={160}
                placeholder={dict.seo.upTo70Chars}
              />
            </label>
            <label className={styles.label}>
              {dict.seo.metaDescription}
              <textarea
                value={form.meta_description ?? ""}
                onChange={(e) =>
                  updateField("meta_description", e.target.value)
                }
                className={styles.input}
                rows={3}
                maxLength={320}
                placeholder={dict.seo.upTo160Chars}
              />
            </label>
            <label className={styles.label}>
              {dict.seo.h1}
              <input
                value={form.meta_h1 ?? ""}
                onChange={(e) => updateField("meta_h1", e.target.value)}
                className={styles.input}
              />
            </label>
            <label className={styles.label}>
              {dict.seo.canonicalUrl}
              <input
                value={form.canonical ?? ""}
                onChange={(e) => updateField("canonical", e.target.value)}
                className={styles.input}
                placeholder="https://example.com/"
              />
            </label>
            <label className={styles.label}>
              {dict.seo.ogImageUrl}
              <input
                value={form.og_image ?? ""}
                onChange={(e) => updateField("og_image", e.target.value)}
                className={styles.input}
                placeholder={dict.seo.ogImagePlaceholder}
              />
            </label>
          </section>
        )}
      </div>
    </main>
  );
}
