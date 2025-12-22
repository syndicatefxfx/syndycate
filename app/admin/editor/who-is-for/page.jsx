"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";
import Link from "next/link";
import { useToast } from "@/components/admin/ToastProvider";
import AdminTopBarActions from "@/components/AdminTopBarActions";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function WhoIsForEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [tag, setTag] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

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
          showToast(fetchError.message, "error");
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
  }, [authLoading, locale, session, supabase]);

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
      showToast(upsertError.message, "error");
      setSaving(false);
      return;
    }

    const sectionId = upserted?.[0]?.id;
    if (!sectionId) {
      showToast(dict.common.errorSectionId, "error");
      setSaving(false);
      return;
    }

    await supabase
      .from("who_is_for_items")
      .delete()
      .eq("section_id", sectionId);

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
      showToast(insertError.message, "error");
    } else {
      showToast(dict.common.saved, "success");
    }
    setSaving(false);
  };

  if (authLoading || !session || !supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.card}>{dict.common.loading}</div>
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
            <div className={styles.skeletonLabel}>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonInput}></div>
            </div>
            <div className={styles.row}>
              <div className={styles.skeletonLabel}>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonInput}></div>
              </div>
              <div className={styles.skeletonLabel}>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonInput}></div>
              </div>
            </div>
            <div className={styles.itemsGrid}>
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <div
                    className={styles.skeletonText}
                    style={{
                      width: "40px",
                      height: "14px",
                      marginBottom: "12px",
                    }}
                  ></div>
                  <div className={styles.skeletonLabel}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonInput}></div>
                  </div>
                  <div className={styles.skeletonLabel}>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonInput}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.section}</div>
              <label className={styles.label}>
                {dict.editor.tag}
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className={styles.input}
                  placeholder="WHO IS THIS FOR?"
                />
              </label>
              <div className={styles.row}>
                <label className={styles.label}>
                  {dict.editor.titlePrefix}
                  <input
                    value={titlePrefix}
                    onChange={(e) => setTitlePrefix(e.target.value)}
                    className={styles.input}
                    placeholder="WHO IS"
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.titleSuffix}
                  <input
                    value={titleSuffix}
                    onChange={(e) => setTitleSuffix(e.target.value)}
                    className={styles.input}
                    placeholder="THIS FOR?"
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.elements}</div>
              <div className={styles.itemsGrid}>
                {items.map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>
                        /{String(index + 1).padStart(2, "0")}
                      </div>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => removeItem(index)}
                      >
                        {dict.common.delete}
                      </button>
                    </div>
                    <label className={styles.label}>
                      {dict.editor.number}
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
                      {dict.editor.title}
                      <input
                        value={item.title ?? ""}
                        onChange={(e) =>
                          updateItem(index, { title: e.target.value })
                        }
                        className={styles.input}
                        placeholder="STARTING FROM SCRATCH"
                      />
                    </label>
                    <div className={styles.bullets}>
                      <div className={styles.bulletsHeader}>
                        <span>{dict.editor.bullets}</span>
                        <button
                          type="button"
                          className={styles.linkBtn}
                          onClick={() => addBullet(index)}
                        >
                          {dict.common.addBullet}
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
                        <div className={styles.muted}>
                          {dict.common.noItems}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addItem}
                className={styles.secondaryBtn}
              >
                {dict.common.addElement}
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
