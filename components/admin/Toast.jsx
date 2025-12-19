"use client";

import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
    </div>
  );
}

