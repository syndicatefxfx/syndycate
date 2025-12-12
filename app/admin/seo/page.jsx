"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";

export default function SeoPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>SEO</div>
            <div className={styles.heading}>Мета и OG</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
            </div>
          </div>
        </header>

        <section className={styles.card}>
          <div className={styles.muted}>
            Раздел в разработке. Здесь будут формы для Title/Description/H1/OG/Canonical.
          </div>
        </section>
      </div>
    </main>
  );
}
