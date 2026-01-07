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

export default function AboutPageEditor() {
  const { supabase, session, loading: authLoading } = useAdminAuth();
  const dict = useAdminDict();
  const { language } = useAdminLocale();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [form, setForm] = useState({
    kicker: "",
    title: "",
    subtitle: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

    supabase
      .from("about_pages")
      .select("kicker, title, subtitle")
      .eq("locale", locale)
      .limit(1)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          showToast(fetchError.message, "error");
          setLoading(false);
          return;
        }

        const record = data?.[0];
        if (record) {
          setForm({
            kicker: record.kicker ?? "About",
            title: record.title ?? "",
            subtitle: record.subtitle ?? "",
          });
        } else {
          setForm({
            kicker: "About",
            title: "Learn more about us",
            subtitle: "Watch our story and mission",
          });
        }
        setLoading(false);
      });
  }, [locale, session, supabase, authLoading]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);

    const { error: upsertError } = await supabase.from("about_pages").upsert(
      {
        locale,
        status: "published",
        kicker: form.kicker,
        title: form.title,
        subtitle: form.subtitle,
      },
      { onConflict: "locale" }
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
            <div className={styles.kicker}>Editor</div>
            <div className={styles.heading}>ABOUT PAGE</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/editor">{dict.common.backBlocks}</Link>
            </div>
          </div>
          <AdminTopBarActions>
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
              onClick={saveSection}
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
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonTextarea}></div>
            </div>
          </section>
        ) : (
          <>
            <section className={styles.panel}>
              <label className={styles.label}>
                <span>{dict.editor.kicker}</span>
                <input
                  type="text"
                  value={form.kicker}
                  onChange={(e) => updateField("kicker", e.target.value)}
                  className={styles.input}
                  placeholder="About"
                />
              </label>
              <label className={styles.label}>
                <span>{dict.editor.heading}</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className={styles.input}
                  placeholder="Learn more about us"
                />
              </label>
              <label className={styles.label}>
                <span>{dict.editor.description || "Subtitle"}</span>
                <textarea
                  value={form.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className={styles.input}
                  rows={3}
                  placeholder="Watch our story and mission"
                />
              </label>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
