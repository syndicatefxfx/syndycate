"use client";
import styles from "@/styles/SaleBanner.module.css";
import { useEffect, useState, useRef } from "react";

export default function SaleBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    // Появляется сразу после монтирования компонента
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event) => {
      if (bannerRef.current && !bannerRef.current.contains(event.target)) {
        setIsClosing(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsClosing(false);
        }, 300);
      }
    };

    // Небольшая задержка, чтобы клик, который показал баннер, не закрыл его сразу
    const timeout = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isVisible]);

  const scrollToParticipation = () => {
    const el = document.getElementById("tariffs");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className={`${styles.banner} ${
        isClosing ? styles.closing : styles.visible
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className={styles.text}>
        Special Hanukkah sale — limited time offers available!
      </span>
      <button className={styles.button} onClick={scrollToParticipation}>
        View offers
      </button>
    </div>
  );
}
