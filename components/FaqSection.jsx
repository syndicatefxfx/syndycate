"use client";
import { useMemo, useState, useEffect } from "react";
import styles from "@/styles/FaqSection.module.css";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useLanguage } from "./LanguageProvider";

export default function FaqSection() {
  const [openId, setOpenId] = useState(null);
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [faqCopy, setFaqCopy] = useState({ tag: "FAQ", items: [] });
  const faqs = faqCopy.items ?? [];

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("faq_sections")
      .select("tag, items:faq_items(question, answer)")
      .eq("locale", language)
      .eq("status", "published")
      .order("ordering", { foreignTable: "faq_items", ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[FAQ] supabase error", error.message || error);
          return;
        }
        const record = data?.[0];
        if (record) {
          setFaqCopy({
            tag: record.tag ?? "FAQ",
            items: record.items ?? [],
          });
        }
      });
  }, [language, supabase]);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.columns}>
        {/* левая колонка */}
        <div className={styles.left}>
          <h2 className={styles.faq}>{faqCopy.tag || "FAQ"}</h2>
        </div>

        {/* правая колонка */}
        <div className={styles.right}>
          <ul className={styles.list}>
            {faqs.map(({ question, answer }, i) => {
              const opened = openId === i;
              return (
                <li
                  key={question}
                  className={`${styles.item} ${opened ? styles.open : ""}`}
                >
                  {/* вопросная строка */}
                  <button
                    className={styles.questionRow}
                    onClick={() => setOpenId(opened ? null : i)}
                  >
                    <span className={styles.question}>{question}</span>
                    <span className={styles.iconBox}>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.icon}
                      >
                        <path
                          d="M10.95 1.05L1.05 10.95M10.95 1.05V10.95M10.95 1.05H1.05"
                          stroke="#0EFEF2"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* ответ (collapsible) */}
                  <div className={styles.answerWrapper}>
                    <p className={styles.answer}>{answer}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
