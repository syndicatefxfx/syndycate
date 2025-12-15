"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";

const blocks = [
  {
    slug: "/admin/editor/who-is-for",
    title: "WHO IS THIS FOR?",
  },
  {
    slug: "/admin/editor/hero",
    title: "HERO",
  },
  {
    slug: "/admin/editor/stats",
    title: "STATS",
  },
  {
    slug: "/admin/editor/program",
    title: "PROGRAM",
  },
  {
    slug: "/admin/editor/results",
    title: "RESULTS",
  },
  {
    slug: "/admin/editor/advantages",
    title: "ADVANTAGES",
  },
  {
    slug: "/admin/editor/participation",
    title: "PARTICIPATION",
  },
  {
    slug: "/admin/editor/faq",
    title: "FAQ",
  },
];

export default function EditorIndex() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Editor</div>
            <div className={styles.heading}>Блоки лендинга</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
            </div>
          </div>
        </header>

        <section className={styles.cardGrid}>
          {blocks.map((block) => (
            <Link key={block.slug} href={block.slug} className={styles.cardLink}>
              <div className={styles.card}>
                <div className={styles.cardAccent}>{block.title}</div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
