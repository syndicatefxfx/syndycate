"use client";
import Image from "next/image";
import styles from "@/styles/AdvantagesSection.module.css";
import { useFloatingBlobs } from "@/lib/useFloatingBlobs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function AdvantagesSection() {
  const sectionRef = useRef(null);
  const headerRowRef = useRef(null);
  const gradRef = useRef(null);
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [advantages, setAdvantages] = useState({
    tag: "",
    title: [],
    quote: "",
    lead: "",
    cards: [],
  });

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("advantages_sections")
      .select(
        `
          tag,
          title_first,
          title_second,
          quote,
          lead,
          cards:advantages_cards(id, ordering, value, description)
        `
      )
      .eq("locale", language)
      .eq("status", "published")
      .order("ordering", { foreignTable: "advantages_cards", ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Advantages] supabase error", error.message || error);
          return;
        }
        const record = data?.[0];
        if (record) {
          setAdvantages({
            tag: record.tag ?? "",
            title: [record.title_first ?? "", record.title_second ?? ""],
            quote: record.quote ?? "",
            lead: record.lead ?? "",
            cards: record.cards ?? [],
          });
        }
      });
  }, [language, supabase]);

  const cards = advantages.cards ?? [];
  const titleLines = advantages.title ?? [];

  useFloatingBlobs(headerRowRef, [gradRef], {
    speedRange: [12, 20], // замедлили движение
    scaleRange: [1.02, 1.06],
    rotateRange: [-3, 3],
  });

  return (
    <section className={styles.section} id="advantages" ref={sectionRef}>
      {/* ───── ДЕКОРАТИВНЫЙ HEADER ROW ───── */}
      <div className={styles.headerRow} ref={headerRowRef}>
        <span className={styles.gradient} ref={gradRef}>
          <svg
            width="173"
            height="344"
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
        {/* слева <OUR ADVANTAGES> */}
        <div className={styles.about}>
          <span className={styles.bracket} />
          <span className={styles.aboutText}>
            {advantages.tag || "OUR ADVANTAGES"}
          </span>
          <span className={styles.bracket} />
        </div>

        {/* справа заголовок + подзаголовок */}
        <div className={styles.rightTitle}>
          <h2 className={styles.title}>
            {titleLines[0] || "SYNDICATE"}
            <br />
            {titleLines[1] || "COMMUNITY SERVER"}
          </h2>
          <p className={styles.subtext}>{advantages.quote}</p>
        </div>
      </div>

      {/* ───── БАННЕР 800 PX ───── */}
      <div className={styles.bannerWrap}>
        <Image
          src="/community-banner.png"
          alt="Syndicate community banner"
          fill
          sizes="100vw"
          className={styles.banner}
          priority
        />
      </div>

      {/* ───── НИЖНИЙ БЛОК ───── */}
      <div className={styles.bottom}>
        {/* левая колонка */}
        <p className={styles.lead}>{advantages.lead}</p>

        {/* правая колонка: карточки */}
        <div className={styles.cardsGrid}>
          {cards.map((c) => (
            <div key={c.id} className={styles.card}>
              <span className={styles.value}>{c.value}</span>
              <p
                className={styles.desc}
                dangerouslySetInnerHTML={{ __html: c.description || "" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
