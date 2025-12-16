import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import styles from "@/styles/Blog.module.css";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/data/blogPosts";

export default function BlogIndexPage() {
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
          <div className={styles.grid}>
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.cardLink}>
                <article className={styles.card}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className={styles.image}
                      priority={false}
                    />
                    <span className={styles.badge}>{post.readTime}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.meta}>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.excerpt}>{post.excerpt}</p>
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
