"use client";
import Image from "next/image";
import styles from "@/styles/ResultsSection.module.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useFloatingBlobs } from "@/lib/useFloatingBlobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useLanguage } from "./LanguageProvider";

export default function ResultsSection() {
  const [arrowDown, setArrowDown] = useState(false);
  const { language } = useLanguage();
  const supabase = React.useMemo(() => createBrowserSupabaseClient(), []);
  const [resultsCopy, setResultsCopy] = useState({
    title: { top: "", highlight: "" },
    bullets: [],
    cta: "",
  });

  const sectionRef = useRef(null);
  const gradRef = useRef(null);
  const bullets = resultsCopy.bullets ?? [];

  useFloatingBlobs(sectionRef, [gradRef], {
    speedRange: [12, 20], // замедлили движение
    scaleRange: [1.02, 1.06],
    rotateRange: [-3, 3],
  });

  const goTo = useCallback((id) => {
    const el = document.getElementById(id) || document.querySelector(id);
    if (!el) return;

    setArrowDown(true);

    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArrowDown(false);
        }
      },
      { threshold: 0.35 } // ~треть секции видна — считаем "вернулись"
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("results_sections")
      .select("title_top, title_highlight, bullets, cta")
      .eq("locale", language)
      .eq("status", "published")
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Results] supabase error", error.message || error);
          return;
        }
        const record = data?.[0];
        if (record) {
          setResultsCopy({
            title: {
              top: record.title_top ?? "",
              highlight: record.title_highlight ?? "",
            },
            bullets: record.bullets ?? [],
            cta: record.cta ?? "",
          });
        }
      });
  }, [language, supabase]);

  return (
    <section className={styles.section} id="results" ref={sectionRef}>
      <div className={styles.columns}>
        {/* ─── левая колонка: только заголовок ─── */}
        <h2 className={styles.title}>
          {resultsCopy.title?.top}
          <br />
          <span>{resultsCopy.title?.highlight}</span>
        </h2>

        {/* ─── правая колонка ─── */}
        <div className={styles.right}>
          {/* список */}
          <ul className={styles.list}>
            {bullets.map((lines, i) => {
              const bulletLines = Array.isArray(lines) ? lines : [lines];
              return (
                <li key={i} className={styles.listRow}>
                  <span className={styles.listText}>
                    {bulletLines.map((ln, j) => (
                      <React.Fragment key={j}>
                        {ln}
                        {j !== bulletLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </span>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="32" height="32" rx="5" fill="#0EFEF2" />
                    <path
                      d="M26.0435 8.54604C26.4288 8.91033 26.6537 9.41274 26.6687 9.94281C26.6837 10.4729 26.4876 10.9872 26.1235 11.3727L14.7902 23.3727C14.6065 23.5668 14.3858 23.7222 14.141 23.8296C13.8963 23.937 13.6325 23.9942 13.3653 23.998C13.098 24.0017 12.8328 23.9518 12.5851 23.8513C12.3375 23.7508 12.1125 23.6016 11.9235 23.4127L5.9235 17.4127C5.57022 17.0336 5.37789 16.5321 5.38703 16.014C5.39617 15.4958 5.60607 15.0015 5.97251 14.635C6.33894 14.2686 6.8333 14.0587 7.35144 14.0496C7.86957 14.0404 8.37103 14.2328 8.75016 14.586L13.2968 19.13L23.2168 8.62604C23.5811 8.2407 24.0835 8.0158 24.6136 8.0008C25.1437 7.9858 25.658 8.18192 26.0435 8.54604Z"
                      fill="#0A0A0A"
                      transform="translate(2 2) scale(0.85)"
                    />
                  </svg>
                </li>
              );
            })}
          </ul>

          {/* гифка вместо картинки */}
          <div className={styles.gifWrap}>
            <Image
              src="/programResults.gif"
              alt="Example trading gif"
              fill
              sizes="(max-width: 768px) 100vw, 904px"
              className={styles.gif}
              priority
            />
          </div>

          {/* кнопка */}
          <div className={styles.fullRow}>
            <button
              className={styles.fullTextBtn}
              onClick={() => goTo("tariffs")}
            >
              {resultsCopy.cta || "Reserve your spot"}
            </button>
            <button
              className={styles.fullArrowBtn}
              onClick={() => goTo("tariffs")}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${styles.arrow} ${
                  arrowDown ? styles.arrowDown : ""
                }`}
              >
                <path
                  d="M10.9497 1.04936L1.05025 10.9489M10.9497 1.04936V10.9489M10.9497 1.04936H1.05025"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <span className={styles.gradient} ref={gradRef}>
        <svg
          width="259"
          height="516"
          viewBox="0 0 259 516"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          overflow="visible"
        >
          <g opacity="0.6" filter="url(#filter0_if_500_2179)">
            <circle
              cx="-27"
              cy="230"
              r="106"
              fill="url(#paint0_linear_500_2179)"
            />
          </g>
          <defs>
            <filter
              id="filter0_if_500_2179"
              x="-313"
              y="-56"
              width="572"
              height="572"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                result="hardAlpha"
              />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="11.6" />
              <feComposite
                in2="hardAlpha"
                operator="arithmetic"
                k2="-1"
                k3="1"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 1 0 0 0 0 0.95 0 0 0 0.4 0"
              />
              <feBlend
                mode="normal"
                in2="shape"
                result="effect1_innerShadow_500_2179"
              />
              <feGaussianBlur
                stdDeviation="90"
                result="effect2_foregroundBlur_500_2179"
              />
            </filter>
            <linearGradient
              id="paint0_linear_500_2179"
              x1="-27"
              y1="124"
              x2="-27"
              y2="336"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#0EFEF2" />
              <stop offset="1" stopColor="#0A0A0A" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </section>
  );
}
