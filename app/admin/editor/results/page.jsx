"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function ResultsEditorPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
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

  useEffect(() => {
    if (!session || !supabase) return;
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
  }, [locale, session, supabase]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Вход выполнен");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

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

  if (!supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>Проверьте Supabase env переменные.</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Назад к разделам</Link>
            </div>
            <h1 className={styles.title}>Admin login</h1>
            <form onSubmit={handleLogin} className={styles.form}>
              <label className={styles.label}>
                Email
                <input name="email" type="email" required className={styles.input} />
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
            <button onClick={handleLogout} className={styles.secondaryBtn}>
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
