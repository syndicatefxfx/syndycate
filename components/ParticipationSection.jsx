"use client";
import styles from "@/styles/ParticipationSection.module.css";
import tStyles from "@/styles/TariffForm.module.css";
import TariffForm from "@/components/TariffForm";
import { useCallback, useEffect, useState } from "react";
import { useDictionary } from "./LanguageProvider";

export default function ParticipationSection() {
  const [active, setActive] = useState(null);
  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState(false);
  const participation = useDictionary().participation ?? {};
  const tariffs = participation.tariffs ?? [];
  const titleLines = participation.title ?? [];
  const modalCloseLabel = participation.form?.modalClose || "Close";

  const openModal = (t) => {
    setClosing(false);
    setActive(t);
    setOpening(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpening(true));
    });
  };

  const startClose = () => {
    setOpening(false);
    setClosing(true);
    setTimeout(() => {
      setActive(null);
      setClosing(false);
    }, 300);
  };

  // закрытие по Esc
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") startClose();
    };
    if (active) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  // блокировка скролла под модалкой
  useEffect(() => {
    if (!active) return;
    const { style } = document.documentElement;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev || "";
    };
  }, [active]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target.dataset.overlay === "1") startClose();
  }, []);

  const handleFormSubmit = async (payload) => {
    // TODO: сюда интеграция с бэком/телеграмом/почтой
    console.log("FORM SUBMIT:", payload);
  };
  return (
    <section className={styles.section} id="tariffs">
      <span className={styles.hLine} />

      <div className={styles.sectionHeader}>
        <div className={styles.about}>
          <span className={styles.bracket} />
          <span className={styles.aboutText}>
            {participation.tag || "TARIFFS"}
          </span>
          <span className={styles.bracket} />
        </div>
        <h2 className={styles.title}>
          {titleLines[0] || "PARTICIPATION"}
          <br />
          {titleLines[1] || "FORMATS"}
        </h2>
      </div>

      <div className={styles.grid}>
        {tariffs.map((t) => (
          <div key={t.id} className={styles.card}>
            <h3 className={styles.cardTitle}>{t.title}</h3>
            <p className={styles.mode}>{t.mode}</p>

            <ul className={styles.list}>
              {(t.bullets ?? []).map((b) => {
                const text = typeof b === "string" ? b : b?.text || "";
                const muted =
                  typeof b === "string"
                    ? b.startsWith("NO ") ||
                      b.toLowerCase().includes("not included")
                    : Boolean(b?.muted);
                return (
                  <li
                    key={`${t.id}-${text}`}
                    className={`${styles.bullet} ${muted ? styles.muted : ""}`}
                  >
                    <span className={styles.bulletIcon}>&lt;</span>
                    {text}
                  </li>
                );
              })}
            </ul>

            {/* дополнительный блок у нижнего края */}
            <div className={styles.extra}>
              <span className={styles.star}>*</span>
              <div className={styles.extraLines}>
                {(t.extra ?? []).map((e) => {
                  const text = typeof e === "string" ? e : e?.text || "";
                  const mutedExtra =
                    typeof e === "string"
                      ? e.toLowerCase().includes("not included")
                      : Boolean(e?.muted);
                  return (
                    <p
                      key={`${t.id}-${text}`}
                      className={`${styles.extraText} ${
                        mutedExtra ? styles.muted : ""
                      }`}
                    >
                      {text}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* цена + кнопка */}
            <div className={styles.bottomRow}>
              <div className={styles.priceWrap}>
                {t.oldPrice && <s className={styles.oldPrice}>{t.oldPrice}</s>}
                <div>
                  {(() => {
                    const price = t.price || "";
                    const symbol = price.match(/^[^\d?]+/)?.[0] || "";
                    const amount = price.slice(symbol.length);
                    return (
                      <>
                        <span className={styles.priceSymbol}>
                          {symbol || "$"}
                        </span>
                        <span className={styles.price}>{amount || price}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className={styles.fullRow}>
                <button
                  className={styles.fullTextBtn}
                  onClick={() => openModal(t)}
                >
                  {t.cta}
                </button>
                <button
                  className={styles.fullArrowBtn}
                  onClick={() => openModal(t)}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
        ))}
      </div>

      {active && (
        <div
          className={`${tStyles.overlay} ${
            closing ? tStyles.closing : opening ? tStyles.open : tStyles.preOpen
          }`}
          data-overlay="1"
          onClick={handleOverlayClick}
        >
          <div
            className={tStyles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className={tStyles.close}
              aria-label={modalCloseLabel}
              onClick={startClose}
            >
              ×
            </button>

            <TariffForm
              tariff={active}
              onClose={startClose}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      )}
    </section>
  );
}
