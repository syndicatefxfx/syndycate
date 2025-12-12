"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";

const sections = [
  {
    slug: "/admin/seo",
    title: "SEO",
    accent: "SEO",
  },
  {
    slug: "/admin/editor",
    title: "Редактор",
    accent: "Content",
  },
  {
    slug: "/admin/blog",
    title: "Блог",
    accent: "Blog",
  },
  {
    slug: "/admin/settings",
    title: "Настройки",
    accent: "Settings",
  },
];

export default function AdminDashboard() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Admin</div>
            <div className={styles.heading}>SYNDICATE</div>
            <div className={styles.subtitle}>Управление сайтом и контентом</div>
          </div>
        </header>

        <section className={styles.cardGrid}>
          {sections.map((section) => (
            <Link key={section.slug} href={section.slug} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardAccent}>{section.accent}</div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
