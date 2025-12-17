"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminDict, useAdminLocale } from "@/components/AdminLocaleProvider";
import { adminLanguages } from "@/lib/admin/i18n";

export default function SettingsPage() {
  const dict = useAdminDict();
  const { language, setLanguage } = useAdminLocale();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Settings</div>
            <div className={styles.heading}>Interface</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">{dict.common.backSections}</Link>
            </div>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.kicker}>{dict.settings.langTitle}</div>
          <p className={styles.muted}>{dict.settings.langDesc}</p>
          <div className={styles.actions} style={{ marginTop: 12 }}>
            {adminLanguages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={
                  language === l.code ? styles.primaryBtn : styles.secondaryBtn
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.muted}>{dict.settings.comingSoon}</div>
        </section>
      </div>
    </main>
  );
}
