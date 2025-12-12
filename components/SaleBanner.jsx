"use client";
import styles from "@/styles/SaleBanner.module.css";
import { useEffect, useState, useRef } from "react";
import { useDictionary } from "./LanguageProvider";

export default function SaleBanner() {
  const dictionary = useDictionary();
  const saleBannerCopy = dictionary.saleBanner ?? {};
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
      // Проверяем, что клик не по баннеру
      if (bannerRef.current && !bannerRef.current.contains(event.target)) {
        // Проверяем, что клик не по хедеру или его элементам
        const header = event.target.closest("header");
        if (header) {
          return; // Не закрываем баннер при клике на хедер
        }

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
        {saleBannerCopy.text ??
          "Special Hanukkah sale — limited time offers available!"}
      </span>
      <button className={styles.button} onClick={scrollToParticipation}>
        {saleBannerCopy.button ?? "View offers"}
      </button>
    </div>
  );
}
