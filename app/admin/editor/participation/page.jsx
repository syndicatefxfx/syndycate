"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function ParticipationEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [section, setSection] = useState({
    tag: "",
    title_first: "",
    title_second: "",
    modal_close: "Close",
  });
  const [tariffs, setTariffs] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);
    setError("");
    setMessage("");

    supabase
      .from("participation_sections")
      .select(
        `
          id,
          tag,
          title_first,
          title_second,
          modal_close,
          tariffs:participation_tariffs(id, ordering, title, mode, bullets, extra, price, old_price, cta)
        `
      )
      .eq("locale", locale)
      .eq("status", "published")
      .order("ordering", {
        foreignTable: "participation_tariffs",
        ascending: true,
      })
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
          modal_close: record?.modal_close ?? "Close",
        });
        setTariffs(
          (record?.tariffs ?? []).sort(
            (a, b) => (a.ordering ?? 0) - (b.ordering ?? 0)
          )
        );
        setLoading(false);
      });
  }, [authLoading, locale, session, supabase]);

  const updateSection = (patch) => {
    setSection((prev) => ({ ...prev, ...patch }));
  };

  const addTariff = () => {
    setTariffs((prev) => [
      ...prev,
      {
        id: null,
        title: "",
        mode: "",
        bullets: [],
        extra: [],
        price: "",
        old_price: "",
        cta: "",
      },
    ]);
  };

  const updateTariff = (index, patch) => {
    setTariffs((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );
  };

  const removeTariff = (index) => {
    setTariffs((prev) => prev.filter((_, i) => i !== index));
  };

  const updateBullet = (tariffIndex, bulletIndex, value, key = "bullets") => {
    setTariffs((prev) =>
      prev.map((t, i) => {
        if (i !== tariffIndex) return t;
        const list = Array.isArray(t[key]) ? [...t[key]] : [];
        list[bulletIndex] = value;
        return { ...t, [key]: list };
      })
    );
  };

  const addBullet = (tariffIndex, key = "bullets") => {
    setTariffs((prev) =>
      prev.map((t, i) => {
        if (i !== tariffIndex) return t;
        const list = Array.isArray(t[key]) ? [...t[key]] : [];
        list.push({ text: "", muted: false });
        return { ...t, [key]: list };
      })
    );
  };

  const removeBullet = (tariffIndex, bulletIndex, key = "bullets") => {
    setTariffs((prev) =>
      prev.map((t, i) => {
        if (i !== tariffIndex) return t;
        const list = Array.isArray(t[key]) ? [...t[key]] : [];
        list.splice(bulletIndex, 1);
        return { ...t, [key]: list };
      })
    );
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);
    setError("");
    setMessage("");

    const { data: upserted, error: upsertError } = await supabase
      .from("participation_sections")
      .upsert(
        {
          locale,
          status: "published",
          tag: section.tag,
          title_first: section.title_first,
          title_second: section.title_second,
          modal_close: section.modal_close,
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
      setError(dict.common.errorSectionId);
      setSaving(false);
      return;
    }

    await supabase
      .from("participation_tariffs")
      .delete()
      .eq("section_id", sectionId);

    const payload = tariffs.map((t, idx) => ({
      section_id: sectionId,
      ordering: idx + 1,
      title: t.title ?? "",
      mode: t.mode ?? "",
      bullets: t.bullets ?? [],
      extra: t.extra ?? [],
      price: t.price ?? "",
      old_price: t.old_price ?? "",
      cta: t.cta ?? "",
    }));

    const { error: insertError } = await supabase
      .from("participation_tariffs")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
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
            <div className={styles.heading}>PARTICIPATION</div>
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
          <div className={styles.panel}>{dict.common.loading}</div>
        ) : (
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.section}</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  {dict.editor.tag}
                  <input
                    value={section.tag ?? ""}
                    onChange={(e) => updateSection({ tag: e.target.value })}
                    className={styles.input}
                    placeholder="TARIFFS"
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.title1}
                  <input
                    value={section.title_first ?? ""}
                    onChange={(e) =>
                      updateSection({ title_first: e.target.value })
                    }
                    className={styles.input}
                    placeholder="PARTICIPATION"
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.title2}
                  <input
                    value={section.title_second ?? ""}
                    onChange={(e) =>
                      updateSection({ title_second: e.target.value })
                    }
                    className={styles.input}
                    placeholder="FORMATS"
                  />
                </label>
              </div>
              <label className={styles.label}>
                {dict.editor.modalCloseLabel}
                <input
                  value={section.modal_close ?? ""}
                  onChange={(e) =>
                    updateSection({ modal_close: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Close"
                />
              </label>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.tariffs}</div>
              <div className={styles.itemsGrid}>
                {tariffs.map((t, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>
                        /{String(idx + 1).padStart(2, "0")}
                      </div>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => removeTariff(idx)}
                      >
                        {dict.common.delete}
                      </button>
                    </div>
                    <label className={styles.label}>
                      {dict.editor.name}
                      <input
                        value={t.title ?? ""}
                        onChange={(e) =>
                          updateTariff(idx, { title: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      {dict.editor.subtitleMode}
                      <input
                        value={t.mode ?? ""}
                        onChange={(e) =>
                          updateTariff(idx, { mode: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      {dict.editor.price}
                      <input
                        value={t.price ?? ""}
                        onChange={(e) =>
                          updateTariff(idx, { price: e.target.value })
                        }
                        className={styles.input}
                        placeholder="$149"
                      />
                    </label>
                    <label className={styles.label}>
                      {dict.editor.oldPrice}
                      <input
                        value={t.old_price ?? ""}
                        onChange={(e) =>
                          updateTariff(idx, { old_price: e.target.value })
                        }
                        className={styles.input}
                        placeholder="$199"
                      />
                    </label>
                    <label className={styles.label}>
                      CTA
                      <input
                        value={t.cta ?? ""}
                        onChange={(e) =>
                          updateTariff(idx, { cta: e.target.value })
                        }
                        className={styles.input}
                        placeholder="Reserve your spot"
                      />
                    </label>

                    <div className={styles.bullets}>
                      <div className={styles.bulletsHeader}>
                        <span>{dict.editor.bullets}</span>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => addBullet(idx, "bullets")}
                        >
                          {dict.common.addBullet}
                        </button>
                      </div>
                      {(t.bullets ?? []).map((b, bulletIdx) => (
                        <div key={bulletIdx} className={styles.bulletRow}>
                          <input
                            value={b?.text ?? b ?? ""}
                            onChange={(e) =>
                              updateBullet(
                                idx,
                                bulletIdx,
                                {
                                  text: e.target.value,
                                  muted: b?.muted ?? false,
                                },
                                "bullets"
                              )
                            }
                            className={styles.input}
                          />
                          <label
                            className={styles.label}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "6px",
                              margin: 0,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={b?.muted ?? false}
                              onChange={(e) =>
                                updateBullet(
                                  idx,
                                  bulletIdx,
                                  {
                                    text: b?.text ?? b ?? "",
                                    muted: e.target.checked,
                                  },
                                  "bullets"
                                )
                              }
                            />
                            Muted
                          </label>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() =>
                              removeBullet(idx, bulletIdx, "bullets")
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(t.bullets ?? []).length === 0 && (
                        <div className={styles.muted}>
                          {dict.common.noItems}
                        </div>
                      )}
                    </div>

                    <div className={styles.bullets}>
                      <div className={styles.bulletsHeader}>
                        <span>Extra</span>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => addBullet(idx, "extra")}
                        >
                          {dict.common.addRow}
                        </button>
                      </div>
                      {(t.extra ?? []).map((b, bulletIdx) => (
                        <div key={bulletIdx} className={styles.bulletRow}>
                          <input
                            value={b?.text ?? b ?? ""}
                            onChange={(e) =>
                              updateBullet(
                                idx,
                                bulletIdx,
                                {
                                  text: e.target.value,
                                  muted: b?.muted ?? false,
                                },
                                "extra"
                              )
                            }
                            className={styles.input}
                          />
                          <label
                            className={styles.label}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: "6px",
                              margin: 0,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={b?.muted ?? false}
                              onChange={(e) =>
                                updateBullet(
                                  idx,
                                  bulletIdx,
                                  {
                                    text: b?.text ?? b ?? "",
                                    muted: e.target.checked,
                                  },
                                  "extra"
                                )
                              }
                            />
                            Muted
                          </label>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() =>
                              removeBullet(idx, bulletIdx, "extra")
                            }
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {(t.extra ?? []).length === 0 && (
                        <div className={styles.muted}>{dict.common.noRows}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addTariff}
                className={styles.secondaryBtn}
              >
                {dict.common.addTariff}
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
