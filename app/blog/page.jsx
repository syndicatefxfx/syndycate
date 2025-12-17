"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import styles from "@/styles/Blog.module.css";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function BlogIndexPage() {
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("blog_posts")
      .select(
        `
          id,
          slug,
          locale,
          title,
          subtitle,
          excerpt,
          read_time,
          og_image,
          published_at,
          created_at
        `
      )
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsLast: true })
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("[Blog list] supabase error", error.message || error);
          setPosts([]);
        } else {
          setPosts(data || []);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language, supabase]);

  return (
    <main className={styles.page}>
      <Header />
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.kicker}>Blog</p>
            <h1 className={styles.title}>Insights, playbooks, and program updates</h1>
            <p className={styles.subtitle}>
              Structured notes on mindset, prop challenges, and execution — same tone and discipline as the main site.
            </p>
          </div>
        </section>

        <section className={styles.listSection}>
          {loading && (
            <div className={styles.grid}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonBody}>
                    <div className={`${styles.skeletonLine} ${styles.short}`} />
                    <div className={`${styles.skeletonLine} ${styles.long}`} />
                    <div className={`${styles.skeletonLine} ${styles.medium}`} />
                    <div className={`${styles.skeletonLine} ${styles.short}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && !posts.length && <div className={styles.muted}>No articles yet.</div>}
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link
                key={`${post.slug}-${post.locale ?? "x"}`}
                href={`/blog/${post.slug}`}
                className={styles.cardLink}
              >
                <article className={styles.card}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={post.og_image || post.image || "/programResults.gif"}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className={styles.image}
                      priority={false}
                    />
                    <span className={styles.badge}>{post.read_time || post.readTime || "–"}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : new Date(post.date || post.created_at || Date.now()).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>{post.read_time || post.readTime || "–"}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.excerpt}>{post.excerpt || post.subtitle}</p>
                    <span className={styles.cta}>Read →</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <FooterSection />
    </main>
  );
}
