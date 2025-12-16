"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function ResultsEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [titleTop, setTitleTop] = useState("");
  const [titleHighlight, setTitleHighlight] = useState("");
  const [bullets, setBullets] = useState([]);
  const [cta, setCta] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);
    setError("");
    setMessage("");

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
          setError(fetchError.message);
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
    setBullets((prev) =>
      prev.map((b, i) => (i === index ? value : b))
    );
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
    setError("");
    setMessage("");

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
            <div className={styles.kicker}>Editor</div>
            <div className={styles.heading}>RESULTS</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/editor">← Ко всем блокам</Link>
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
            <button onClick={saveSection} className={styles.primaryBtn} disabled={saving}>
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
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>Заголовок</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  Top
                  <input
                    value={titleTop ?? ""}
                    onChange={(e) => setTitleTop(e.target.value)}
                    className={styles.input}
                  />
                </label>
                <label className={styles.label}>
                  Highlight
                  <input
                    value={titleHighlight ?? ""}
                    onChange={(e) => setTitleHighlight(e.target.value)}
                    className={styles.input}
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>Список</div>
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
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addBullet} className={styles.secondaryBtn}>
                Добавить пункт
              </button>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>CTA</div>
              <label className={styles.label}>
                CTA текст
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

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
