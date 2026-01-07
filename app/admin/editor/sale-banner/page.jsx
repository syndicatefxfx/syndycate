"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";
import AdminTopBarActions from "@/components/AdminTopBarActions";
import { useToast } from "@/components/admin/ToastProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function SaleBannerEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [form, setForm] = useState({
    enabled: true,
    text: "Special Hanukkah sale — limited time offers available!",
    button: "View offers",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

    supabase
      .from("sale_banner_settings")
      .select("enabled, text, button")
      .eq("locale", locale)
      .eq("status", "published")
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
            enabled: record.enabled ?? true,
            text:
              record.text ??
              "Special Hanukkah sale — limited time offers available!",
            button: record.button ?? "View offers",
          });
        }
        setLoading(false);
      });
  }, [authLoading, locale, session, supabase]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!supabase || !session) return;
    setSaving(true);

    const { error: upsertError } = await supabase
      .from("sale_banner_settings")
      .upsert(
        {
          locale,
          status: "published",
          enabled: form.enabled,
          text: form.text,
          button: form.button,
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
            <div className={styles.heading}>SALE BANNER</div>
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
              onClick={saveSettings}
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
          </section>
        ) : (
          <section className={styles.panel}>
            <div className={styles.kicker}>{dict.editor.section}</div>
            <label
              className={`${styles.label} ${styles.checkboxLabel}`}
              style={{ marginBottom: "24px" }}
            >
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => updateField("enabled", e.target.checked)}
              />
              <span>Enable sale banner</span>
            </label>
            <label className={styles.label}>
              Banner text
              <input
                value={form.text}
                onChange={(e) => updateField("text", e.target.value)}
                className={styles.input}
                placeholder="Special Hanukkah sale — limited time offers available!"
              />
            </label>
            <label className={styles.label}>
              Button text
              <input
                value={form.button}
                onChange={(e) => updateField("button", e.target.value)}
                className={styles.input}
                placeholder="View offers"
              />
            </label>
          </section>
        )}
      </div>
    </main>
  );
}

