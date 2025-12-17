"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";
import { useAdminLocale } from "@/components/AdminLocaleProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function HeroEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { language } = useAdminLocale();
  const t = (ru, en) => (language === "en" ? en : ru);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [form, setForm] = useState({
    heading_top: "",
    heading_highlight_first: "",
    heading_highlight_second: "",
    heading_bottom: "",
    text_above_button: "",
    cta: "",
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
      .from("hero_sections")
      .select(
        `
          id,
          heading_top,
          heading_highlight_first,
          heading_highlight_second,
          heading_bottom,
          subheading_lines,
          cta
        `
      )
      .eq("locale", locale)
      .limit(1)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        const record = data?.[0];
        if (record) {
          setForm({
            heading_top: record.heading_top ?? "",
            heading_highlight_first: record.heading_highlight_first ?? "",
            heading_highlight_second: record.heading_highlight_second ?? "",
            heading_bottom: record.heading_bottom ?? "",
            text_above_button: (record.subheading_lines ?? [])[0] ?? "",
            cta: record.cta ?? "",
            timer_label: record.timer_label ?? "",
            timer_days_label: record.timer_days_label ?? "D",
            timer_hours_label: record.timer_hours_label ?? "H",
            timer_minutes_label: record.timer_minutes_label ?? "M",
            sale_badge: record.sale_badge ?? "",
          });
        } else {
          setForm({
            heading_top: "",
            heading_highlight_first: "",
            heading_highlight_second: "",
            heading_bottom: "",
            text_above_button: "",
            cta: "",
          });
        }
        setLoading(false);
      });
  }, [locale, session, supabase]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSubheading = () => {
    setForm((prev) => ({
      ...prev,
      subheading_lines: [...(prev.subheading_lines ?? []), ""],
    }));
  };

  const updateSubheading = (index, value) => {
    setForm((prev) => {
      const lines = [...(prev.subheading_lines ?? [])];
      lines[index] = value;
      return { ...prev, subheading_lines: lines };
    });
  };

  const removeSubheading = (index) => {
    setForm((prev) => {
      const lines = [...(prev.subheading_lines ?? [])].filter(
        (_line, i) => i !== index
      );
      return { ...prev, subheading_lines: lines };
    });
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { error: upsertError } = await supabase.from("hero_sections").upsert(
      {
        locale,
        status: "published",
        heading_top: form.heading_top,
        heading_highlight_first: form.heading_highlight_first,
        heading_highlight_second: form.heading_highlight_second,
        heading_bottom: form.heading_bottom,
        subheading_lines: form.text_above_button
          ? [form.text_above_button]
          : [],
        cta: form.cta,
      },
      { onConflict: "locale" }
    );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setMessage(dict.common.saved);
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
            <div className={styles.heading}>HERO</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/editor">{dict.common.backBlocks}</Link>
            </div>
          </div>
          <div className={styles.actions}>
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
            <button onClick={logout} className={styles.secondaryBtn}>
              {dict.common.logout}
            </button>
          </div>
        </header>

        {loading ? (
          <section className={styles.panel}>
            <div className={styles.skeletonKicker}></div>
            <div className={styles.row}>
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
              <div className={styles.skeletonLabel}>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonInput}></div>
              </div>
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
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.heading}</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  <span>{dict.editor.topLine}</span>
                  <input
                    value={form.heading_top ?? ""}
                    onChange={(e) => updateField("heading_top", e.target.value)}
                    className={styles.input}
                    placeholder="THE"
                  />
                </label>
                <label className={styles.label}>
                  <span>Highlight 1</span>
                  <input
                    value={form.heading_highlight_first ?? ""}
                    onChange={(e) =>
                      updateField("heading_highlight_first", e.target.value)
                    }
                    className={styles.input}
                    placeholder="NEW ERA"
                  />
                </label>
                <label className={styles.label}>
                  <span>Highlight 2</span>
                  <input
                    value={form.heading_highlight_second ?? ""}
                    onChange={(e) =>
                      updateField("heading_highlight_second", e.target.value)
                    }
                    className={styles.input}
                    placeholder="OF TRADING"
                  />
                </label>
                <label className={styles.label}>
                  <span>{dict.editor.bottomLine}</span>
                  <input
                    value={form.heading_bottom ?? ""}
                    onChange={(e) =>
                      updateField("heading_bottom", e.target.value)
                    }
                    className={styles.input}
                    placeholder="IN ISRAEL"
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.copyCta}</div>
              <label className={styles.label}>
                <span>{dict.editor.copyAboveButton}</span>
                <textarea
                  value={form.text_above_button ?? ""}
                  onChange={(e) =>
                    updateField("text_above_button", e.target.value)
                  }
                  className={styles.input}
                  rows={3}
                  placeholder="CLOSED-COMMUNITY TRAINING FOR THOSE WHO WANT TO MASTER THE MARKET"
                />
              </label>
              <label className={styles.label}>
                <span>CTA</span>
                <input
                  value={form.cta ?? ""}
                  onChange={(e) => updateField("cta", e.target.value)}
                  className={styles.input}
                  placeholder="Reserve your spot"
                />
              </label>
            </section>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
