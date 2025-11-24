"use client";
import { useEffect, useState } from "react";
import styles from "@/styles/SuccessModal.module.css";
import { useDictionary } from "./LanguageProvider";

export default function SuccessModal({ onClose }) {
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const formCopy = useDictionary().participation?.form ?? {};
  const successCopy = formCopy.success ?? {};
  const title = successCopy.title || "THANK YOU";
  const message =
    successCopy.message ||
    "Thank you for leaving your details, we will contact you soon";

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpening(true));
    });

    // Отслеживание конверсии лида через Meta Pixel
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  }, []);

  const handleClose = () => {
    setOpening(false);
    setClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  // закрытие по Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // блокировка скролла под модалкой
  useEffect(() => {
    const { style } = document.documentElement;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev || "";
    };
  }, []);

  return (
    <div
      className={`${styles.overlay} ${
        closing ? styles.closing : opening ? styles.open : ""
      }`}
      data-overlay="1"
      onClick={(e) => {
        if (e.target.dataset.overlay === "1") handleClose();
      }}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          className={styles.close}
          aria-label={formCopy.modalClose || "Close"}
          onClick={handleClose}
        >
          ×
        </button>

        <div className={styles.content}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    </div>
  );
}
