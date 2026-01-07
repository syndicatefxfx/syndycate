"use client";
import styles from "@/styles/SaleBanner.module.css";
import { useEffect, useState, useRef, useMemo } from "react";
import { useDictionary } from "./LanguageProvider";
import { useLanguage } from "./LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function SaleBanner() {
  const dictionary = useDictionary();
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [bannerData, setBannerData] = useState({
    enabled: false, // По умолчанию отключен, пока не загрузятся данные
    text: "Special Hanukkah sale — limited time offers available!",
    button: "View offers",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("sale_banner_settings")
      .select("enabled, text, button")
      .eq("locale", language)
      .eq("status", "published")
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[SaleBanner] supabase error", error.message || error);
          // При ошибке отключаем баннер
          setBannerData({
            enabled: false,
            text: "Special Hanukkah sale — limited time offers available!",
            button: "View offers",
          });
          return;
        }
        const record = data?.[0];
        if (record) {
          // Явно проверяем enabled - если он false, то false, если null/undefined, то false
          setBannerData({
            enabled: record.enabled === true,
            text:
              record.text ||
              "Special Hanukkah sale — limited time offers available!",
            button: record.button || "View offers",
          });
        } else {
          // Если запись не найдена, отключаем баннер
          setBannerData({
            enabled: false,
            text: "Special Hanukkah sale — limited time offers available!",
            button: "View offers",
          });
        }
      });
  }, [language, supabase]);

  useEffect(() => {
    // Появляется сразу после монтирования компонента, только если баннер включен
    if (bannerData.enabled) {
      setIsVisible(true);
    } else {
      // Если баннер отключен, сразу скрываем его
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [bannerData.enabled]);

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

  // Если баннер отключен, не рендерим его
  if (!bannerData.enabled || !isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className={`${styles.banner} ${
        isClosing ? styles.closing : styles.visible
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className={styles.text}>
        {bannerData.text ||
          dictionary.saleBanner?.text ||
          "Special Hanukkah sale — limited time offers available!"}
      </span>
      <button className={styles.button} onClick={scrollToParticipation}>
        {bannerData.button ||
          dictionary.saleBanner?.button ||
          "View offers"}
      </button>
    </div>
  );
}
