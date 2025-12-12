"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/Admin.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function WhoIsForEditorPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [tag, setTag] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");
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
      .from("who_is_for_sections")
      .select(
        `
          id,
          tag,
          title_prefix,
          title_suffix,
          items:who_is_for_items(id, ordering, number_label, title, bullets)
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
        setTag(record?.tag ?? "");
        setTitlePrefix(record?.title_prefix ?? "");
        setTitleSuffix(record?.title_suffix ?? "");
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

  const updateItem = (index, patch) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: null,
        number_label: `/0${prev.length + 1}`,
        title: "",
        bullets: [],
      },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addBullet = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, bullets: [...(item.bullets ?? []), ""] } : item
      )
    );
  };

  const updateBullet = (itemIndex, bulletIndex, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;
        const bullets = [...(item.bullets ?? [])];
        bullets[bulletIndex] = value;
        return { ...item, bullets };
      })
    );
  };

  const removeBullet = (itemIndex, bulletIndex) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== itemIndex) return item;
        const bullets = [...(item.bullets ?? [])].filter(
          (_, j) => j !== bulletIndex
        );
        return { ...item, bullets };
      })
    );
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { data: upserted, error: upsertError } = await supabase
      .from("who_is_for_sections")
      .upsert(
        {
          locale,
          tag,
          title_prefix: titlePrefix,
          title_suffix: titleSuffix,
          status: "published",
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

    await supabase.from("who_is_for_items").delete().eq("section_id", sectionId);

    const payload = items.map((item, index) => ({
      section_id: sectionId,
      ordering: index + 1,
      number_label: item.number_label ?? item.number ?? "",
      title: item.title ?? "",
      bullets: item.bullets ?? [],
    }));

    const { error: insertError } = await supabase
      .from("who_is_for_items")
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
        <div className={styles.card}>Проверьте Supabase env переменные.</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>
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
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Editor</div>
            <div className={styles.heading}>WHO IS THIS FOR?</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
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
          <div className={styles.card}>Загрузка...</div>
        ) : (
          <>
            <section className={styles.card}>
              <div className={styles.kicker}>Секция</div>
              <label className={styles.label}>
                Tag
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className={styles.input}
                  placeholder="WHO IS THIS FOR?"
                />
              </label>
              <div className={styles.row}>
                <label className={styles.label}>
                  Title prefix
                  <input
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    className={styles.input}
                    placeholder="WHO IS"
                  />
                </label>
                <label className={styles.label}>
                  Title suffix
                  <input
                    value={titleSuffix}
                    onChange={(e) => setTitleSuffix(e.target.value)}
                    className={styles.input}
                    placeholder="THIS FOR?"
                  />
                </label>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.kicker}>Элементы</div>
              <div className={styles.itemsGrid}>
                {items.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>/{String(index + 1).padStart(2, "0")}</div>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => removeItem(index)}
                      >
                        Удалить
                      </button>
                    </div>
                    <label className={styles.label}>
                      Number
                      <input
                        value={item.number_label ?? ""}
                        onChange={(e) =>
                          updateItem(index, { number_label: e.target.value })
                        }
                        className={styles.input}
                        placeholder="/01"
                      />
                    </label>
                    <label className={styles.label}>
                      Title
                      <input
                        value={item.title ?? ""}
                        onChange={(e) => updateItem(index, { title: e.target.value })}
                        className={styles.input}
                        placeholder="STARTING FROM SCRATCH"
                      />
                    </label>
                    <div className={styles.bullets}>
                      <div className={styles.bulletsHeader}>
                        <span>Bullets</span>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => addBullet(index)}
                        >
                          Добавить пункт
                        </button>
                      </div>
                      {(item.bullets ?? []).map((bullet, bulletIndex) => (
                        <div key={bulletIndex} className={styles.bulletRow}>
                          <input
                            value={bullet ?? ""}
                            onChange={(e) =>
                              updateBullet(index, bulletIndex, e.target.value)
                            }
                            className={styles.input}
                          />
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => removeBullet(index, bulletIndex)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(item.bullets ?? []).length === 0 && (
                        <div className={styles.muted}>Нет пунктов</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addItem} className={styles.secondaryBtn}>
                Добавить элемент
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
