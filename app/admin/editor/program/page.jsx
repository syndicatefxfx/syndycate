"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict } from "@/components/AdminLocaleProvider";
import { useAdminLocale } from "@/components/AdminLocaleProvider";
import AdminTopBarActions from "@/components/AdminTopBarActions";
import { useToast } from "@/components/admin/ToastProvider";

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

export default function ProgramEditorPage() {
  const { supabase, session, loading: authLoading, logout } = useAdminAuth();
  const dict = useAdminDict();
  const { language } = useAdminLocale();
  const { showToast } = useToast();
  const t = (ru, en) => (language === "en" ? en : ru);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("en");
  const [titleLines, setTitleLines] = useState([]);
  const [paragraphs, setParagraphs] = useState([]);
  const [buttons, setButtons] = useState({ expand: "", collapse: "" });
  const [previewCount, setPreviewCount] = useState(8);
  const [modules, setModules] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    setLoading(true);

    supabase
      .from("program_sections")
      .select(
        `
          id,
          title_lines,
          paragraphs,
          button_expand,
          button_collapse,
          preview_count,
          modules:program_modules(id, ordering, title, answer)
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
        setTitleLines(record?.title_lines ?? []);
        setParagraphs(record?.paragraphs ?? []);
        setButtons({
          expand: record?.button_expand ?? "",
          collapse: record?.button_collapse ?? "",
        });
        setPreviewCount(record?.preview_count ?? 8);
        setModules(
          (record?.modules ?? []).sort(
            (a, b) => (a.ordering ?? 0) - (b.ordering ?? 0)
          )
        );
        setLoading(false);
      });
  }, [authLoading, locale, session, supabase]);

  const updateTitleLine = (index, patch) => {
    setTitleLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, ...patch } : line))
    );
  };

  const updateParagraphLines = (index, value) => {
    const lines = value.split("\n").filter((l) => l.trim() !== "");
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, lines } : p))
    );
  };

  const updateParagraphHighlight = (index, value) => {
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, highlight: value } : p))
    );
  };

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { id: null, title: "", answer: "", ordering: prev.length + 1 },
    ]);
  };

  const updateModule = (index, patch) => {
    setModules((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m))
    );
  };

  const saveSection = async () => {
    if (!supabase || !session) return;
    setSaving(true);

    const { data: upserted, error: upsertError } = await supabase
      .from("program_sections")
      .upsert(
        {
          locale,
          status: "published",
          title_lines: titleLines,
          paragraphs: paragraphs,
          button_expand: buttons.expand,
          button_collapse: buttons.collapse,
          preview_count: previewCount,
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

    await supabase.from("program_modules").delete().eq("section_id", sectionId);

    const payload = modules.map((m, idx) => ({
      section_id: sectionId,
      ordering: idx + 1,
      title: m.title ?? "",
      answer: m.answer ?? "",
    }));

    const { error: insertError } = await supabase
      .from("program_modules")
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
            <div className={styles.heading}>PROGRAM</div>
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
          <>
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
                      <div
                        className={styles.skeletonText}
                        style={{ width: "60px" }}
                      ></div>
                      <div
                        className={styles.skeletonInput}
                        style={{ width: "20px", height: "20px" }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className={styles.panel}>
              <div className={styles.skeletonKicker}></div>
              <div className={styles.itemsGrid}>
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.skeletonLabel}>
                      <div className={styles.skeletonText}></div>
                      <div className={styles.skeletonTextarea}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className={styles.panel}>
              <div className={styles.skeletonKicker}></div>
              <div className={styles.itemsGrid}>
                {[...Array(4)].map((_, idx) => (
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
                      <div className={styles.skeletonTextarea}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.heading}</div>
              <div className={styles.itemsGrid}>
                {titleLines.map((line, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <label className={styles.label}>
                      {dict.editor.text}
                      <input
                        value={line.text ?? ""}
                        onChange={(e) =>
                          updateTitleLine(idx, { text: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label
                      className={`${styles.label} ${styles.checkboxLabel}`}
                    >
                      <input
                        type="checkbox"
                        checked={line.highlight ?? false}
                        onChange={(e) =>
                          updateTitleLine(idx, { highlight: e.target.checked })
                        }
                      />
                      <span>Highlight</span>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.paragraphs}</div>
              <div className={styles.itemsGrid}>
                {paragraphs.map((p, idx) => (
                  <div
                    key={idx}
                    className={`${styles.itemCard} ${
                      idx === 0 ? styles.firstParagraphCard : ""
                    }`}
                  >
                    <label className={styles.label}>
                      {dict.editor.linesOnePerRow}
                      <textarea
                        value={(p.lines ?? []).join("\n")}
                        onChange={(e) =>
                          updateParagraphLines(idx, e.target.value)
                        }
                        className={`${styles.input} ${
                          idx === 0 ? styles.fullHeightTextarea : ""
                        }`}
                        rows={idx === 0 ? undefined : 4}
                      />
                    </label>
                    {idx > 0 && (
                      <label className={styles.label}>
                        {dict.editor.highlightOptional}
                        <input
                          value={p.highlight ?? ""}
                          onChange={(e) =>
                            updateParagraphHighlight(idx, e.target.value)
                          }
                          className={styles.input}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.buttonsPreview}</div>
              <div className={styles.row}>
                <label className={styles.label}>
                  {dict.editor.expandLabel}
                  <input
                    value={buttons.expand ?? ""}
                    onChange={(e) =>
                      setButtons((prev) => ({
                        ...prev,
                        expand: e.target.value,
                      }))
                    }
                    className={styles.input}
                    placeholder="The whole program"
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.collapseLabel}
                  <input
                    value={buttons.collapse ?? ""}
                    onChange={(e) =>
                      setButtons((prev) => ({
                        ...prev,
                        collapse: e.target.value,
                      }))
                    }
                    className={styles.input}
                    placeholder="Hide program"
                  />
                </label>
                <label className={styles.label}>
                  {dict.editor.previewCount}
                  <input
                    type="number"
                    min={1}
                    value={previewCount}
                    onChange={(e) =>
                      setPreviewCount(Number(e.target.value) || 1)
                    }
                    className={styles.input}
                  />
                </label>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.kicker}>{dict.editor.modules}</div>
              <div className={styles.itemsGrid}>
                {modules.map((m, idx) => (
                  <div key={idx} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>
                        /{String(idx + 1).padStart(2, "0")}
                      </div>
                    </div>
                    <label className={styles.label}>
                      {dict.editor.title}
                      <input
                        value={m.title ?? ""}
                        onChange={(e) =>
                          updateModule(idx, { title: e.target.value })
                        }
                        className={styles.input}
                      />
                    </label>
                    <label className={styles.label}>
                      {dict.editor.description}
                      <textarea
                        value={m.answer ?? ""}
                        onChange={(e) =>
                          updateModule(idx, { answer: e.target.value })
                        }
                        className={styles.input}
                        rows={6}
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
