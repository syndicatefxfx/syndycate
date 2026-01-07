"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import styles from "@/styles/Header.module.css";
import Image from "next/image";
import Link from "next/link";
import { supportedLanguages, useLanguage } from "./LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [socialLinks, setSocialLinks] = useState({
    telegram_url: "https://t.me/syndicatefxx",
    instagram_url: "https://www.instagram.com/syndicatefx.co/",
  });
  const navItems = [
    { id: "program", label: "PROGRAM", className: styles.button1 },
    { id: "tariffs", label: "TARIFFS", className: styles.button2 },
    { id: "faq", label: "FAQ", className: styles.button3 },
    { id: "blog", label: "BLOG", className: styles.button4, href: "/blog" },
    { id: "about", label: "ABOUT", className: styles.button5, href: "/about" },
  ];

  // блокируем прокрутку фона, когда открыт оверлей
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [open]);

  // ESC закрывает меню
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Загрузка ссылок на соцсети
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("site_settings")
      .select("telegram_url, instagram_url")
      .eq("id", 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setSocialLinks({
            telegram_url: data.telegram_url || "https://t.me/syndicatefxx",
            instagram_url:
              data.instagram_url || "https://www.instagram.com/syndicatefx.co/",
          });
        }
      });
  }, [supabase]);

  // плавный скролл к секции
  const goTo = useCallback((id) => {
    const el = document.getElementById(id) || document.querySelector(id);
    if (el) {
      setOpen(false);
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 160);
    } else {
      // если секции нет (например, на странице блога), отправляем на главную с якорем
      window.location.href = `/#${id}`;
    }
  }, []);

  return (
    <header className={styles.header}>
      <Link
        href="/"
        className={styles.logoContainer}
        aria-label="Go to homepage"
      >
        <Image
          src="/logo.svg"
          alt="SNDCT Logo"
          width={40}
          height={40}
          className={styles.logoImage}
        />
        <div className={styles.logo}>SNDCT</div>
      </Link>
      <div className={styles.line} />

      {/* десктопная навигация (>1280px) */}
      <div className={styles.circles}>
        <nav className={styles.nav}>
          {navItems.map(({ id, label, className, href }) =>
            href ? (
              <Link key={id} href={href} className={className}>
                {label}
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                className={className}
                onClick={() => goTo(id)}
              >
                {label}
              </button>
            )
          )}
        </nav>
        <div className={styles.languageSwitch}>
          {supportedLanguages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              className={`${styles.langBtn} ${
                language === code ? styles.langBtnActive : ""
              }`}
              aria-pressed={language === code}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.circlesRow}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={styles.circle}
            aria-label="Instagram"
            href={socialLinks.instagram_url}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.0286 2C14.1536 2.003 14.7246 2.009 15.2176 2.023L15.4116 2.03C15.6356 2.038 15.8566 2.048 16.1236 2.06C17.1876 2.11 17.9136 2.278 18.5506 2.525C19.2106 2.779 19.7666 3.123 20.3226 3.678C20.8313 4.17773 21.2248 4.78247 21.4756 5.45C21.7226 6.087 21.8906 6.813 21.9406 7.878C21.9526 8.144 21.9626 8.365 21.9706 8.59L21.9766 8.784C21.9916 9.276 21.9976 9.847 21.9996 10.972L22.0006 11.718V13.028C22.003 13.7574 21.9953 14.4868 21.9776 15.216L21.9716 15.41C21.9636 15.635 21.9536 15.856 21.9416 16.122C21.8916 17.187 21.7216 17.912 21.4756 18.55C21.2248 19.2175 20.8313 19.8223 20.3226 20.322C19.8228 20.8307 19.2181 21.2242 18.5506 21.475C17.9136 21.722 17.1876 21.89 16.1236 21.94L15.4116 21.97L15.2176 21.976C14.7246 21.99 14.1536 21.997 13.0286 21.999L12.2826 22H10.9736C10.2438 22.0026 9.51409 21.9949 8.78457 21.977L8.59057 21.971C8.35318 21.962 8.11584 21.9517 7.87857 21.94C6.81457 21.89 6.08857 21.722 5.45057 21.475C4.7834 21.2241 4.17901 20.8306 3.67957 20.322C3.17051 19.8224 2.77668 19.2176 2.52557 18.55C2.27857 17.913 2.11057 17.187 2.06057 16.122L2.03057 15.41L2.02557 15.216C2.00713 14.4868 1.9988 13.7574 2.00057 13.028V10.972C1.9978 10.2426 2.00514 9.5132 2.02257 8.784L2.02957 8.59C2.03757 8.365 2.04757 8.144 2.05957 7.878C2.10957 6.813 2.27757 6.088 2.52457 5.45C2.77626 4.7822 3.17079 4.17744 3.68057 3.678C4.17972 3.16955 4.78376 2.77607 5.45057 2.525C6.08857 2.278 6.81357 2.11 7.87857 2.06C8.14457 2.048 8.36657 2.038 8.59057 2.03L8.78457 2.024C9.51376 2.00623 10.2432 1.99857 10.9726 2.001L13.0286 2ZM12.0006 7C10.6745 7 9.40272 7.52678 8.46503 8.46447C7.52735 9.40215 7.00057 10.6739 7.00057 12C7.00057 13.3261 7.52735 14.5979 8.46503 15.5355C9.40272 16.4732 10.6745 17 12.0006 17C13.3267 17 14.5984 16.4732 15.5361 15.5355C16.4738 14.5979 17.0006 13.3261 17.0006 12C17.0006 10.6739 16.4738 9.40215 15.5361 8.46447C14.5984 7.52678 13.3267 7 12.0006 7ZM12.0006 9C12.3945 8.99993 12.7847 9.07747 13.1487 9.22817C13.5127 9.37887 13.8434 9.5998 14.122 9.87833C14.4007 10.1569 14.6217 10.4875 14.7725 10.8515C14.9233 11.2154 15.001 11.6055 15.0011 11.9995C15.0011 12.3935 14.9236 12.7836 14.7729 13.1476C14.6222 13.5116 14.4013 13.8423 14.1227 14.121C13.8442 14.3996 13.5135 14.6206 13.1496 14.7714C12.7856 14.9223 12.3955 14.9999 12.0016 15C11.2059 15 10.4429 14.6839 9.88025 14.1213C9.31764 13.5587 9.00157 12.7956 9.00157 12C9.00157 11.2044 9.31764 10.4413 9.88025 9.87868C10.4429 9.31607 11.2059 9 12.0016 9M17.2516 5.5C16.92 5.5 16.6021 5.6317 16.3677 5.86612C16.1333 6.10054 16.0016 6.41848 16.0016 6.75C16.0016 7.08152 16.1333 7.39946 16.3677 7.63388C16.6021 7.8683 16.92 8 17.2516 8C17.5831 8 17.901 7.8683 18.1355 7.63388C18.3699 7.39946 18.5016 7.08152 18.5016 6.75C18.5016 6.41848 18.3699 6.10054 18.1355 5.86612C17.901 5.6317 17.5831 5.5 17.2516 5.5Z"
                fill="#0A0A0A"
              />
            </svg>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className={styles.circle}
            href={socialLinks.telegram_url}
            aria-label="Telegram"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.64 8.8C16.49 10.38 15.84 14.22 15.51 15.99C15.37 16.74 15.09 16.99 14.83 17.02C14.25 17.07 13.81 16.64 13.25 16.27C12.37 15.69 11.87 15.33 11.02 14.77C10.03 14.12 10.67 13.76 11.24 13.18C11.39 13.03 13.95 10.7 14 10.49C14.0069 10.4582 14.006 10.4252 13.9973 10.3938C13.9886 10.3624 13.9724 10.3337 13.95 10.31C13.89 10.26 13.81 10.28 13.74 10.29C13.65 10.31 12.25 11.24 9.52 13.08C9.12 13.35 8.76 13.49 8.44 13.48C8.08 13.47 7.4 13.28 6.89 13.11C6.26 12.91 5.77 12.8 5.81 12.45C5.83 12.27 6.08 12.09 6.55 11.9C9.47 10.63 11.41 9.79 12.38 9.39C15.16 8.23 15.73 8.03 16.11 8.03C16.19 8.03 16.38 8.05 16.5 8.15C16.6 8.23 16.63 8.34 16.64 8.42C16.63 8.48 16.65 8.66 16.64 8.8Z"
                fill="#0A0A0A"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* планшет/мобилка (≤1280px) — кнопка меню */}
      <button
        className={styles.menuBtn}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-overlay"
        lang="en"
        translate="no"
      >
        MENU
      </button>

      {/* оверлей-меню */}
      <div
        id="menu-overlay"
        className={`${styles.menuOverlay} ${open ? styles.menuOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.overlayHeader}>
          <div className={styles.overlayLogo}>SNDCT</div>
          <span className={styles.hLine} />
        </div>

        <nav className={styles.overlayNav}>
          {navItems.map(({ id, label, href }) =>
            href ? (
              <Link
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                lang="en"
                translate="no"
              >
                {label}
              </Link>
            ) : (
              <button
                key={id}
                type="button"
                onClick={() => goTo(id)}
                lang="en"
                translate="no"
              >
                {label}
              </button>
            )
          )}
        </nav>
        <div className={styles.overlayLangSwitch}>
          {supportedLanguages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              className={`${styles.overlayLangBtn} ${
                language === code ? styles.overlayLangBtnActive : ""
              }`}
              aria-pressed={language === code}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.overlaySocials}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            href={socialLinks.telegram_url}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.socialIcon}
            >
              <rect width="64" height="64" rx="32" fill="white" />
              <path
                d="M32 16C23.168 16 16 23.168 16 32C16 40.832 23.168 48 32 48C40.832 48 48 40.832 48 32C48 23.168 40.832 16 32 16ZM39.424 26.88C39.184 29.408 38.144 35.552 37.616 38.384C37.392 39.584 36.944 39.984 36.528 40.032C35.6 40.112 34.896 39.424 34 38.832C32.592 37.904 31.792 37.328 30.432 36.432C28.848 35.392 29.872 34.816 30.784 33.888C31.024 33.648 35.12 29.92 35.2 29.584C35.2111 29.5331 35.2096 29.4803 35.1957 29.4301C35.1817 29.3799 35.1558 29.3339 35.12 29.296C35.024 29.216 34.896 29.248 34.784 29.264C34.64 29.296 32.4 30.784 28.032 33.728C27.392 34.16 26.816 34.384 26.304 34.368C25.728 34.352 24.64 34.048 23.824 33.776C22.816 33.456 22.032 33.28 22.096 32.72C22.128 32.432 22.528 32.144 23.28 31.84C27.952 29.808 31.056 28.464 32.608 27.824C37.056 25.968 37.968 25.648 38.576 25.648C38.704 25.648 39.008 25.68 39.2 25.84C39.36 25.968 39.408 26.144 39.424 26.272C39.408 26.368 39.44 26.656 39.424 26.88Z"
                fill="#0A0A0A"
              />
            </svg>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={socialLinks.instagram_url}
            aria-label="Instagram"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="64" height="64" rx="32" fill="white" />
              <path
                d="M33.6457 16C35.4457 16.0048 36.3593 16.0144 37.1481 16.0368L37.4585 16.048C37.8169 16.0608 38.1705 16.0768 38.5977 16.096C40.3001 16.176 41.4617 16.4448 42.4809 16.84C43.5369 17.2464 44.4265 17.7968 45.3161 18.6848C46.13 19.4844 46.7596 20.452 47.1609 21.52C47.5561 22.5392 47.8249 23.7008 47.9049 25.4048C47.9241 25.8304 47.9401 26.184 47.9529 26.544L47.9625 26.8544C47.9865 27.6416 47.9961 28.5552 47.9993 30.3552L48.0009 31.5488V33.6448C48.0048 34.8118 47.9925 35.9789 47.9641 37.1456L47.9545 37.456C47.9417 37.816 47.9257 38.1696 47.9065 38.5952C47.8265 40.2992 47.5545 41.4592 47.1609 42.48C46.7596 43.548 46.13 44.5156 45.3161 45.3152C44.5165 46.1291 43.549 46.7587 42.4809 47.16C41.4617 47.5552 40.3001 47.824 38.5977 47.904L37.4585 47.952L37.1481 47.9616C36.3593 47.984 35.4457 47.9952 33.6457 47.9984L32.4521 48H30.3577C29.1901 48.0041 28.0225 47.9918 26.8553 47.9632L26.5449 47.9536C26.1651 47.9392 25.7853 47.9227 25.4057 47.904C23.7033 47.824 22.5417 47.5552 21.5209 47.16C20.4534 46.7585 19.4864 46.1289 18.6873 45.3152C17.8728 44.5158 17.2427 43.5482 16.8409 42.48C16.4457 41.4608 16.1769 40.2992 16.0969 38.5952L16.0489 37.456L16.0409 37.1456C16.0114 35.9789 15.9981 34.8119 16.0009 33.6448V30.3552C15.9965 29.1882 16.0082 28.0211 16.0361 26.8544L16.0473 26.544C16.0601 26.184 16.0761 25.8304 16.0953 25.4048C16.1753 23.7008 16.4441 22.5408 16.8393 21.52C17.242 20.4515 17.8733 19.4839 18.6889 18.6848C19.4876 17.8713 20.454 17.2417 21.5209 16.84C22.5417 16.4448 23.7017 16.176 25.4057 16.096C25.8313 16.0768 26.1865 16.0608 26.5449 16.048L26.8553 16.0384C28.022 16.01 29.1891 15.9977 30.3561 16.0016L33.6457 16ZM32.0009 24C29.8792 24 27.8443 24.8429 26.3441 26.3431C24.8438 27.8434 24.0009 29.8783 24.0009 32C24.0009 34.1217 24.8438 36.1566 26.3441 37.6569C27.8443 39.1571 29.8792 40 32.0009 40C34.1226 40 36.1575 39.1571 37.6578 37.6569C39.1581 36.1566 40.0009 34.1217 40.0009 32C40.0009 29.8783 39.1581 27.8434 37.6578 26.3431C36.1575 24.8429 34.1226 24 32.0009 24ZM32.0009 27.2C32.6313 27.1999 33.2554 27.3239 33.8379 27.5651C34.4203 27.8062 34.9495 28.1597 35.3953 28.6053C35.8411 29.051 36.1947 29.5801 36.436 30.1624C36.6773 30.7447 36.8016 31.3689 36.8017 31.9992C36.8018 32.6295 36.6778 33.2537 36.4366 33.8361C36.1955 34.4185 35.842 34.9478 35.3964 35.3935C34.9507 35.8393 34.4217 36.193 33.8393 36.4343C33.257 36.6756 32.6329 36.7999 32.0025 36.8C30.7295 36.8 29.5086 36.2943 28.6084 35.3941C27.7082 34.4939 27.2025 33.273 27.2025 32C27.2025 30.727 27.7082 29.5061 28.6084 28.6059C29.5086 27.7057 30.7295 27.2 32.0025 27.2M40.4025 21.6C39.8721 21.6 39.3634 21.8107 38.9883 22.1858C38.6132 22.5609 38.4025 23.0696 38.4025 23.6C38.4025 24.1304 38.6132 24.6391 38.9883 25.0142C39.3634 25.3893 39.8721 25.6 40.4025 25.6C40.9329 25.6 41.4416 25.3893 41.8167 25.0142C42.1918 24.6391 42.4025 24.1304 42.4025 23.6C42.4025 23.0696 42.1918 22.5609 41.8167 22.1858C41.4416 21.8107 40.9329 21.6 40.4025 21.6Z"
                fill="#0A0A0A"
              />
            </svg>
          </a>
        </div>

        {/* кнопка-стрелка снизу — закрыть меню */}
        <button
          className={`${styles.overlayClose} ${open ? styles.up : ""}`}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="19.5" fill="none" stroke="white" />
            <path
              d="M13 16.5L20 23.5L27 16.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
