"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import styles from "@/styles/BlogPost.module.css";
import Image from "next/image";
import Link from "next/link";
import { blogPosts, getPostBySlug } from "@/data/blogPosts";
import { useLanguage } from "@/components/LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useParams, useRouter } from "next/navigation";

export default function BlogPostPage() {
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      if (!supabase) {
        const fallback = getPostBySlug(slug);
        if (fallback) {
          setPost(fallback);
        } else {
          router.replace("/blog");
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      const { data, error: fetchError } = await supabase
        .from("blog_posts")
        .select(
          `
            slug,
            locale,
            title,
            subtitle,
            excerpt,
            content,
            read_time,
            og_image,
            published_at,
            meta_h1
          `
        )
        .eq("slug", slug)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsLast: true })
        .limit(1);

      if (fetchError) {
        console.error("[Blog post] supabase error", fetchError.message || fetchError);
        setError(fetchError.message || "Failed to load post");
        const fallback = getPostBySlug(slug);
        if (fallback) {
          setPost(fallback);
        }
        setLoading(false);
        return;
      }

      if (data?.length) {
        setPost(data[0]);
        setLoading(false);
        return;
      }

      const fallback = getPostBySlug(slug);
      if (fallback) {
        setPost(fallback);
      }
      setLoading(false);
    };

    load();
  }, [language, router, slug, supabase]);

  useEffect(() => {
    if (!slug || supabase) return;
    // this handles the null-supabase branch (env missing) separately
    const fallback = getPostBySlug(slug);
    if (fallback) {
      setPost(fallback);
    } else {
      router.replace("/blog");
    }
    setLoading(false);
  }, [router, slug, supabase]);

  if (loading) {
    return (
      <main className={styles.page}>
        <Header />
        <article className={styles.article}>
          <div className={styles.hero}>
            <div className={styles.heroText}>
              <p className={`${styles.kicker} ${styles.skeletonLine}`} />
              <p className={`${styles.title} ${styles.skeletonLine}`} />
              <p className={`${styles.subtitle} ${styles.skeletonLine}`} />
              <div className={`${styles.meta} ${styles.skeletonLine}`} />
            </div>
            <div className={`${styles.heroImage} ${styles.skeletonBox}`} />
          </div>

          <div className={styles.content}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <p key={idx} className={`${styles.skeletonLine} ${styles.paragraphSkeleton}`} />
            ))}
          </div>
        </article>
        <FooterSection />
      </main>
    );
  }

  if (!post) {
    return (
      <main className={styles.page}>
        <Header />
        <article className={styles.article}>
          <div className={styles.content}>
            <p>Article not found.</p>
            <Link href="/blog" className={styles.backLink}>
              ← Back to all articles
            </Link>
            {error && <p className={styles.error}>{error}</p>}
          </div>
        </article>
        <FooterSection />
      </main>
    );
  }

  const h1 = post.meta_h1 || post.title;
  const paragraphs = Array.isArray(post.content) ? post.content : [];
  const imageSrc = post.og_image || post.image || "/programResults.gif";

  return (
    <main className={styles.page}>
      <Header />

      <article className={styles.article}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Blog</p>
            <h1 className={styles.title}>{h1}</h1>
            {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
            <div className={styles.meta}>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString()
                  : new Date().toLocaleDateString()}
              </span>
              <span>•</span>
              <span>{post.read_time || "–"}</span>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src={imageSrc}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className={styles.image}
              priority
            />
          </div>
        </div>

        <div className={styles.content}>
          {paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.footerNav}>
          <Link href="/blog" className={styles.backLink}>
            ← Back to all articles
          </Link>
        </div>
      </article>
      <FooterSection />
    </main>
  );
}
