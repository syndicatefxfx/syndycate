"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function AdvantagesEditorPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [section, setSection] = useState({
    tag: "",
    title_first: "",
    title_second: "",
    quote: "",
    lead: "",
  });
  const [cards, setCards] = useState([]);
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
      .from("advantages_sections")
      .select(
        `
          id,
          tag,
          title_first,
          title_second,
          quote,
          lead,
          cards:advantages_cards(id, ordering, value, description)
        `
      )
      .eq("locale", locale)
      .eq("status", "published")
      .order("ordering", { foreignTable: "advantages_cards", ascending: true })
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
          title_first: record?.title_first ?? "",
          title_second: record?.title_second ?? "",
          quote: record?.quote ?? "",
          lead: record?.lead ?? "",
        });
        setCards(
          (record?.cards ?? []).sort(
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

  const updateCard = (index, patch) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c))
    );
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { data: upserted, error: upsertError } = await supabase
      .from("advantages_sections")
      .upsert(
        {
          locale,
          status: "published",
          tag: section.tag,
          title_first: section.title_first,
          title_second: section.title_second,
          quote: section.quote,
          lead: section.lead,
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

    await supabase.from("advantages_cards").delete().eq("section_id", sectionId);

    const payload = cards.map((c, idx) => ({
      section_id: sectionId,
      ordering: idx + 1,
      value: c.value ?? "",
      description: c.description ?? "",
    }));

    const { error: insertError } = await supabase
      .from("advantages_cards")
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
            <div className={styles.heading}>ADVANTAGES</div>
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
                  Tag
                  <input
                    value={section.tag ?? ""}
                    onChange={(e) => updateSection({ tag: e.target.value })}
                    className={styles.input}
                    placeholder="OUR ADVANTAGES"
                  />
                </label>
                <label className={styles.label}>
                  Title 1
                  <input
                    value={section.title_first ?? ""}
                    onChange={(e) => updateSection({ title_first: e.target.value })}
                    className={styles.input}
                    placeholder="SYNDICATE"
                  />
                </label>
                <label className={styles.label}>
                  Title 2
                  <input
                    value={section.title_second ?? ""}
                    onChange={(e) => updateSection({ title_second: e.target.value })}
                    className={styles.input}
                    placeholder="COMMUNITY SERVER"
                  />
                </label>
              </div>
              <label className={styles.label}>
                Quote
                <textarea
                  value={section.quote ?? ""}
                  onChange={(e) => updateSection({ quote: e.target.value })}
                  className={styles.input}
                  rows={2}
                />
              </label>
              <label className={styles.label}>
                Lead
                <textarea
                  value={section.lead ?? ""}
                  onChange={(e) => updateSection({ lead: e.target.value })}
                  className={styles.input}
                  rows={4}
                />
              </label>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>Карточки</div>
              <div className={styles.itemsGrid}>
                {cards.map((c, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>/{String(idx + 1).padStart(2, "0")}</div>
                    </div>
                    <label className={styles.label}>
                      Value
                      <input
                        value={c.value ?? ""}
                        onChange={(e) => updateCard(idx, { value: e.target.value })}
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      Description (можно с <br/>)
                      <textarea
                        value={c.description ?? ""}
                        onChange={(e) =>
                          updateCard(idx, { description: e.target.value })
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
