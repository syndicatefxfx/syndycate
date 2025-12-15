"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";

export default function SettingsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Settings</div>
            <div className={styles.heading}>Настройки</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">← Ко всем разделам</Link>
            </div>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.muted}>
            Раздел в разработке. План: контакты, соцсети, email для заявок, коды аналитики.
          </div>
        </section>
      </div>
    </main>
  );
}
