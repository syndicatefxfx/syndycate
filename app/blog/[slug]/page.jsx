import Header from "@/components/Header";
import styles from "@/styles/BlogPost.module.css";
import Image from "next/image";
import Link from "next/link";
import { blogPosts, getPostBySlug } from "@/data/blogPosts";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <Header />

      <article className={styles.article}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Blog</p>
            <h1 className={styles.title}>{post.title}</h1>
            {post.subtitle && <p className={styles.subtitle}>{post.subtitle}</p>}
            <div className={styles.meta}>
              <span>{new Date(post.date).toLocaleDateString()}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 960px"
              className={styles.image}
              priority
            />
          </div>
        </div>

        <div className={styles.content}>
          {post.content.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        <div className={styles.footerNav}>
          <Link href="/blog" className={styles.backLink}>
            ← Back to all articles
          </Link>
        </div>
      </article>
    </main>
  );
}
