"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";

export default function BlogPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Blog</div>
            <div className={styles.heading}>Статьи</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
            </div>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.muted}>
            Раздел в разработке. План: список статей со статусами, датой, SEO-полями и slug.
          </div>
        </section>
      </div>
    </main>
  );
}
