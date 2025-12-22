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

export default function AdvantagesEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { showToast } = useToast();
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

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
          showToast(fetchError.message, "error");
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
  }, [authLoading, locale, session, supabase]);

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
      .from("advantages_cards")
      .delete()
      .eq("section_id", sectionId);

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
      showToast(insertError.message, "error");
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
            <div className={styles.heading}>ADVANTAGES</div>
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
              {[...Array(4)].map((_, idx) => (
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
                  {dict.editor.tag}
                  <input
                    value={section.tag ?? ""}
                    onChange={(e) => updateSection({ tag: e.target.value })}
                    className={styles.input}
                    placeholder="OUR ADVANTAGES"
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
                    placeholder="SYNDICATE"
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
                    placeholder="COMMUNITY SERVER"
                  />
                </label>
              </div>
              <label className={styles.label}>
                {dict.editor.quote}
                <textarea
                  value={section.quote ?? ""}
                  onChange={(e) => updateSection({ quote: e.target.value })}
                  className={styles.input}
                  rows={2}
                />
              </label>
              <label className={styles.label}>
                {dict.editor.lead}
                <textarea
                  value={section.lead ?? ""}
                  onChange={(e) => updateSection({ lead: e.target.value })}
                  className={styles.input}
                  rows={4}
                />
              </label>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.cards}</div>
              <div className={styles.itemsGrid}>
                {cards.map((c, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>
                        /{String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <label className={styles.label}>
                      {dict.editor.value}
                      <input
                        value={c.value ?? ""}
                        onChange={(e) =>
                          updateCard(idx, { value: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      {dict.editor.description}
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
      </div>
    </main>
  );
}
