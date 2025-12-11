"use client";
import styles from "@/styles/WhoIsForSection.module.css";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useLanguage } from "./LanguageProvider";

export default function WhoIsForSection() {
  const { language } = useLanguage();
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return undefined;
    }

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
      .eq("locale", language)
      .eq("status", "published")
      .order("ordering", { foreignTable: "who_is_for_items", ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          return;
        }
        const record = data?.[0];
        if (record) {
          setSectionData({
            tag: record.tag,
            titlePrefix: record.title_prefix,
            titleSuffix: record.title_suffix,
            items: record.items ?? [],
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

  const items = useMemo(() => {
    const sourceItems = sectionData?.items ?? [];
    return sourceItems.map((item, index) => ({
      id: item.id ?? item.item_id ?? item.who_is_for_items_id ?? `item-${index}`,
      number: item.number_label ?? item.number ?? "",
      title: item.title ?? "",
      bullets: item.bullets ?? [],
    }));
  }, [sectionData]);

  const tag = sectionData?.tag ?? "WHO IS THIS FOR?";
  const titlePrefix = sectionData?.titlePrefix ?? "WHO IS";
  const titleSuffix = sectionData?.titleSuffix ?? "THIS FOR?";

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.about}>
          <span className={styles.bracket} />
          <span className={styles.aboutText}>{tag}</span>
          <span className={styles.bracket} />
        </div>
        <h2 className={styles.title}>
          <span>{titlePrefix}</span> {titleSuffix}
        </h2>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.number}>{item.number}</div>

            <div className={styles.content}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <span className={styles.square} />
              </div>

              <ul className={styles.list}>
                {item.bullets?.map((b, i) => (
                  <li key={`${item.id}-${i}`} className={styles.bullet}>
                    <span
                      className={`${styles.bulletIcon} ${
                        styles[`delay${i % 6}`]
                      }`}
                    >
                      &lt;
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
