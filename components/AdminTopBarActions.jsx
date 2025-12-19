"use client";

import { useAdminAuth } from "./AdminAuthProvider";
import { useAdminDict } from "./AdminLocaleProvider";
import styles from "@/styles/Admin.module.css";

export default function AdminTopBarActions({ children }) {
  const { session, logout } = useAdminAuth();
  const dict = useAdminDict();

  if (!session) return null;

  return (
    <div className={styles.actions}>
      {children}
      <button onClick={logout} className={styles.secondaryBtn}>
        {dict.common.logout}
      </button>
    </div>
  );
}
