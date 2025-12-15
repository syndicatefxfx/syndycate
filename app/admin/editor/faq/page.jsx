"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function FaqEditorPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [tag, setTag] = useState("");
  const [items, setItems] = useState([]);
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
      .from("faq_sections")
      .select(
        `
          id,
          tag,
          items:faq_items(id, ordering, question, answer)
        `
      )
      .eq("locale", locale)
      .eq("status", "published")
      .order("ordering", { foreignTable: "faq_items", ascending: true })
      .limit(1)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        const record = data?.[0];
        setTag(record?.tag ?? "");
        setItems(
          (record?.items ?? []).sort(
            (a, b) => (a.ordering ?? 0) - (b.ordering ?? 0)
          )
        );
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

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: null, question: "", answer: "" },
    ]);
  };

  const updateItem = (index, patch) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { data: upserted, error: upsertError } = await supabase
      .from("faq_sections")
      .upsert(
        {
          locale,
          status: "published",
          tag,
        },
        { onConflict: "locale" }
      )
      .select("id")
      .limit(1);

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    const sectionId = upserted?.[0]?.id;
    if (!sectionId) {
      setError("Не удалось получить id секции");
      setSaving(false);
      return;
    }

    await supabase.from("faq_items").delete().eq("section_id", sectionId);

    const payload = items.map((it, idx) => ({
      section_id: sectionId,
      ordering: idx + 1,
      question: it.question ?? "",
      answer: it.answer ?? "",
    }));

    const { error: insertError } = await supabase
      .from("faq_items")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
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
            <div className={styles.heading}>FAQ</div>
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
              <div className={styles.kicker}>Тег</div>
              <label className={styles.label}>
                FAQ tag
                <input
                  value={tag ?? ""}
                  onChange={(e) => setTag(e.target.value)}
                  className={styles.input}
                  placeholder="FAQ"
                />
              </label>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>Вопросы</div>
              <div className={styles.itemsGrid}>
                {items.map((it, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>/{String(idx + 1).padStart(2, "0")}</div>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => removeItem(idx)}
                      >
                        Удалить
                      </button>
                    </div>
                    <label className={styles.label}>
                      Вопрос
                      <input
                        value={it.question ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { question: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      Ответ
                      <textarea
                        value={it.answer ?? ""}
                        onChange={(e) =>
                          updateItem(idx, { answer: e.target.value })
                        }
                        className={styles.input}
                        rows={3}
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className={styles.secondaryBtn}>
                Добавить вопрос
              </button>
            </section>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
