"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function StatsEditorPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [section, setSection] = useState({
    tag: "",
    title_primary: "",
    title_secondary: "",
    description: "",
  });
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
      .from("stats_sections")
      .select(
        `
          id,
          tag,
          title_primary,
          title_secondary,
          description,
          items:stats_items(id, ordering, value, note, description, area)
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
        setSection({
          tag: record?.tag ?? "",
          title_primary: record?.title_primary ?? "",
          title_secondary: record?.title_secondary ?? "",
          description: record?.description ?? "",
        });
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

  const updateSection = (patch) => {
    setSection((prev) => ({ ...prev, ...patch }));
  };

  const updateItem = (index, patch) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { data: upserted, error: upsertError } = await supabase
      .from("stats_sections")
      .upsert(
        {
          locale,
          status: "published",
          tag: section.tag,
          title_primary: section.title_primary,
          title_secondary: section.title_secondary,
          description: section.description,
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

    await supabase.from("stats_items").delete().eq("section_id", sectionId);

    const payload = items.map((item, index) => ({
      section_id: sectionId,
      ordering: index + 1,
      value: item.value ?? "",
      note: item.note ?? "",
      description: item.description ?? "",
      area: item.area ?? "",
    }));

    const { error: insertError } = await supabase
      .from("stats_items")
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
            <div className={styles.heading}>STATS</div>
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
              <div className={styles.kicker}>Секция</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  Tag
                  <input
                    value={section.tag ?? ""}
                    onChange={(e) => updateSection({ tag: e.target.value })}
                    className={styles.input}
                    placeholder="<ABOUT US>"
                  />
                </label>
                <label className={styles.label}>
                  Title primary
                  <input
                    value={section.title_primary ?? ""}
                    onChange={(e) =>
                      updateSection({ title_primary: e.target.value })
                    }
                    className={styles.input}
                    placeholder="WHAT IS SYNDICATE"
                  />
                </label>
                <label className={styles.label}>
                  Title secondary
                  <input
                    value={section.title_secondary ?? ""}
                    onChange={(e) =>
                      updateSection({ title_secondary: e.target.value })
                    }
                    className={styles.input}
                    placeholder="IN NUMBERS?"
                  />
                </label>
              </div>
              <label className={styles.label}>
                Description
                <textarea
                  value={section.description ?? ""}
                  onChange={(e) =>
                    updateSection({ description: e.target.value })
                  }
                  className={styles.input}
                  rows={3}
                  placeholder="We are happy to provide..."
                />
              </label>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>Элементы</div>
              <div className={styles.itemsGrid}>
                {items.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>/{String(index + 1).padStart(2, "0")}</div>
                    </div>
                    <label className={styles.label}>
                      Value
                      <input
                        value={item.value ?? ""}
                        onChange={(e) =>
                          updateItem(index, { value: e.target.value })
                        }
                        className={styles.input}
                        placeholder="28"
                      />
                    </label>
                    <label className={styles.label}>
                      Note
                      <input
                        value={item.note ?? ""}
                        onChange={(e) => updateItem(index, { note: e.target.value })}
                        className={styles.input}
                        placeholder="(01)"
                      />
                    </label>
                    <label className={styles.label}>
                      Description
                      <textarea
                        value={item.description ?? ""}
                        onChange={(e) =>
                          updateItem(index, { description: e.target.value })
                        }
                        className={styles.input}
                        rows={3}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
