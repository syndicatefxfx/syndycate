"use client";

import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminDict } from "@/components/AdminLocaleProvider";

const sections = [
  {
    slug: "/admin/seo",
    titleKey: "SEO",
    accent: "SEO",
  },
  {
    slug: "/admin/editor",
    titleKey: "editor",
    accent: "Content",
  },
  {
    slug: "/admin/blog",
    titleKey: "blog",
    accent: "Blog",
  },
  {
    slug: "/admin/settings",
    titleKey: "settings",
    accent: "Settings",
  },
];

export default function AdminDashboard() {
  const dict = useAdminDict();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>Admin</div>
            <div className={styles.heading}>SYNDICATE</div>
            <div className={styles.subtitle}>{dict.admin.subtitle}</div>
          </div>
        </header>

        <section className={styles.cardGrid}>
          {sections.map((section) => (
            <Link
              key={section.slug}
              href={section.slug}
              className={styles.cardLink}
            >
              <div className={styles.card}>
                <div className={styles.cardAccent}>
                  {section.titleKey === "SEO"
                    ? "SEO"
                    : section.titleKey === "editor"
                    ? "Editor"
                    : section.titleKey === "blog"
                    ? "Blog"
                    : "Settings"}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
