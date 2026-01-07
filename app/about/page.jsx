"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import styles from "@/styles/Blog.module.css";
import { useLanguage } from "@/components/LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AboutPage() {
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [pageContent, setPageContent] = useState({
    kicker: "About",
    title: "Learn more about us",
    subtitle: "Watch our story and mission",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    // Загружаем контент страницы About (можно добавить таблицу в будущем)
    supabase
      .from("about_pages")
      .select("kicker, title, subtitle")
      .eq("locale", language)
      .eq("status", "published")
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data?.[0]) {
          setPageContent({
            kicker: data[0].kicker || "About",
            title: data[0].title || "Learn more about us",
            subtitle: data[0].subtitle || "Watch our story and mission",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [language, supabase]);

  // Извлекаем ID видео из YouTube URL
  const youtubeId = "jZ1MzQiwNOc";
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            {loading ? (
              <>
                <div
                  className={styles.skeletonText}
                  style={{
                    width: "100px",
                    height: "13px",
                    marginBottom: "8px",
                  }}
                />
                <div
                  className={styles.skeletonText}
                  style={{
                    width: "300px",
                    height: "48px",
                    marginBottom: "4px",
                  }}
                />
                <div
                  className={styles.skeletonText}
                  style={{
                    width: "400px",
                    height: "16px",
                  }}
                />
              </>
            ) : (
              <>
                <p className={styles.kicker}>{pageContent.kicker}</p>
                <h1 className={styles.title}>{pageContent.title}</h1>
                <p className={styles.subtitle}>{pageContent.subtitle}</p>
              </>
            )}
          </div>
        </section>

        <section className={styles.listSection}>
          <div className={styles.grid} style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                width: "100%",
                position: "relative",
                paddingBottom: "56.25%", // 16:9 aspect ratio
                height: 0,
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid #2c2c2c",
                background: "#1a1a1a",
              }}
            >
              <iframe
                src={embedUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="About us video"
              />
            </div>
          </div>
        </section>
      </div>
      <FooterSection />
    </main>
  );
}

