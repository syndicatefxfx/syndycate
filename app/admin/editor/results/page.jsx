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

export default function ResultsEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [titleTop, setTitleTop] = useState("");
  const [titleHighlight, setTitleHighlight] = useState("");
  const [bullets, setBullets] = useState([]);
  const [cta, setCta] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

    supabase
      .from("results_sections")
      .select(
        `
          id,
          title_top,
          title_highlight,
          bullets,
          cta
        `
      )
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
        setTitleTop(record?.title_top ?? "");
        setTitleHighlight(record?.title_highlight ?? "");
        setBullets(record?.bullets ?? []);
        setCta(record?.cta ?? "");
        setLoading(false);
      });
  }, [authLoading, locale, session, supabase]);

  const updateBullet = (index, value) => {
    setBullets((prev) => prev.map((b, i) => (i === index ? value : b)));
  };

  const addBullet = () => {
    setBullets((prev) => [...prev, ""]);
  };

  const removeBullet = (index) => {
    setBullets((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);

    const { error: upsertError } = await supabase
      .from("results_sections")
      .upsert(
        {
          locale,
          status: "published",
          title_top: titleTop,
          title_highlight: titleHighlight,
          bullets: bullets,
          cta,
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
            <div className={styles.heading}>RESULTS</div>
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
            <div className={styles.itemsGrid}>
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <div className={styles.skeletonLabel}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonInput}></div>
                  </div>
                  <div className={styles.skeletonLabel}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonTextarea}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.heading}</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  {dict.editor.top}
                  <input
                    value={titleTop ?? ""}
                    onChange={(e) => setTitleTop(e.target.value)}
                    className={styles.input}
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.highlight}
                  <input
                    value={titleHighlight ?? ""}
                    onChange={(e) => setTitleHighlight(e.target.value)}
                    className={styles.input}
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.list}</div>
              <div className={styles.itemsGrid}>
                {bullets.map((b, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <textarea
                      value={b ?? ""}
                      onChange={(e) => updateBullet(idx, e.target.value)}
                      className={styles.input}
                      rows={2}
                    />
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => removeBullet(idx)}
                      >
                        {dict.common.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addBullet}
                className={styles.secondaryBtn}
              >
                {dict.common.addItem}
              </button>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.cta}</div>
              <label className={styles.label}>
                {dict.editor.ctaText}
                <input
                  value={cta ?? ""}
                  onChange={(e) => setCta(e.target.value)}
                  className={styles.input}
                  placeholder="Reserve your spot"
                />
              </label>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
