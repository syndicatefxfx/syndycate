"use client";
import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import styles from "@/styles/ProgramSection.module.css";
import { flushSync } from "react-dom";
import { useFloatingBlobs } from "@/lib/useFloatingBlobs";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { useLanguage } from "./LanguageProvider";

export default function ProgramSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openedIdx, setOpenedIdx] = useState(null);
  const [programCopy, setProgramCopy] = useState({
    titles: { desktop: [], tablet: [] },
    paragraphs: [],
    buttons: {},
    modules: [],
    previewCount: 8,
  });

  const wrapperRef = useRef(null);
  const listRef = useRef(null);
  const rowRefs = useRef([]);

  const sectionRef = useRef(null);
  const gradRef = useRef(null);
  const rowAnimTimerRef = useRef(null);
  const { language } = useLanguage();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const modules = programCopy.modules ?? [];
  const previewCount = Math.max(1, programCopy.previewCount ?? 8);
  const titleDesktopLines = programCopy.titles?.desktop ?? [];
  const titleTabletLines =
    programCopy.titles?.tablet ?? programCopy.titles?.desktop ?? [];
  const paragraphBlocks = programCopy.paragraphs ?? [];
  const buttonLabels = programCopy.buttons ?? {};

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("program_sections")
      .select(
        `
          title_lines,
          paragraphs,
          button_expand,
          button_collapse,
          preview_count,
          modules:program_modules(id, ordering, title, answer)
        `
      )
      .eq("locale", language)
      .eq("status", "published")
      .order("ordering", { foreignTable: "program_modules", ascending: true })
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Program] supabase error", error.message || error);
          return;
        }
        const record = data?.[0];
        if (record) {
          setProgramCopy({
            titles: {
              desktop: record.title_lines ?? [],
              tablet: record.title_lines ?? [],
            },
            paragraphs: record.paragraphs ?? [],
            buttons: {
              expand: record.button_expand ?? "",
              collapse: record.button_collapse ?? "",
            },
            modules: record.modules ?? [],
            previewCount: record.preview_count ?? 8,
          });
        }
      });
  }, [language, supabase]);

  const renderTitleLines = (lines = []) =>
    lines.map((line, idx) => (
      <Fragment key={`${line.text || idx}-${idx}`}>
        <span className={line.highlight ? styles.primary : undefined}>
          {line.text}
        </span>
        {idx < lines.length - 1 && <br />}
      </Fragment>
    ));

  const renderParagraphLines = (lines = []) =>
    lines.map((line, idx) => (
      <Fragment key={`${line}-${idx}`}>
        {line}
        {idx < lines.length - 1 && <br />}
      </Fragment>
    ));

  // Создаём градиент только один раз при монтировании компонента
  useEffect(() => {
    if (gradRef.current && !gradRef.current.dataset.initialized) {
      gradRef.current.dataset.initialized = "true";

      // Запускаем анимацию градиента напрямую, без хука
      const gradient = gradRef.current;
      const section = sectionRef.current;

      if (gradient && section) {
        const sectionRect = section.getBoundingClientRect();
        const gradientWidth = 200; // примерная ширина градиента
        const gradientHeight = 200; // примерная высота градиента

        // Фиксируем размеры секции
        const fixedWidth = sectionRect.width;
        const fixedHeight = sectionRect.height;

        // Функция для случайного числа
        const random = (min, max) => Math.random() * (max - min) + min;

        // Функция для движения градиента
        const moveGradient = () => {
          const maxX = Math.max(0, fixedWidth - gradientWidth);
          const maxY = Math.max(0, fixedHeight - gradientHeight);

          const targetX = random(0, maxX);
          const targetY = random(0, maxY);
          const duration = random(12, 20) * 1000; // замедлили с 5-10 до 12-20 секунд

          const animation = gradient.animate(
            [
              {
                top: gradient.style.top || "0px",
                left: gradient.style.left || "0px",
              },
              {
                top: `${targetY}px`,
                left: `${targetX}px`,
              },
            ],
            {
              duration,
              easing: "ease-in-out",
              fill: "forwards",
            }
          );

          animation.onfinish = () => {
            gradient.style.top = `${targetY}px`;
            gradient.style.left = `${targetX}px`;
            moveGradient(); // рекурсивно создаём новую анимацию
          };
        };

        // Устанавливаем начальную позицию
        const startX = random(0, Math.max(0, fixedWidth - gradientWidth));
        const startY = random(0, Math.max(0, fixedHeight - gradientHeight));
        gradient.style.position = "absolute";
        gradient.style.top = `${startY}px`;
        gradient.style.left = `${startX}px`;
        gradient.style.zIndex = "0"; // низкий z-index чтобы не перекрывать элементы

        // Запускаем анимацию
        moveGradient();
      }
    }
  }, []); // пустой массив зависимостей - выполняется только один раз

  useEffect(() => {
    if (openedIdx == null) return;
    const el = rowRefs.current[openedIdx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [openedIdx]);

  const toggleRow = (idx) => {
    const list = listRef.current;
    const row = rowRefs.current[idx];
    const answer = row?.querySelector(`.${styles.answerWrapper}`);

    // если по какой-то причине не нашли элементы — просто переключаем
    if (!list || !answer) {
      setOpenedIdx((cur) => (cur === idx ? null : idx));
      return;
    }

    // сообщаем хуку, что идёт локальная анимация высоты
    list.classList.add(styles.rowAnimating);

    const off = (e) => {
      if (e.propertyName !== "max-height") return; // ждём конца transition у answerWrapper
      list.classList.remove(styles.rowAnimating);
      answer.removeEventListener("transitionend", off);
    };
    answer.addEventListener("transitionend", off);

    setOpenedIdx((cur) => (cur === idx ? null : idx));
  };

  const DURATION = 1000;

  const easeOutQuad = (t) => t * (2 - t);
  const smoothFollow = (delta) => {
    if (delta <= 0) return;
    const startY = window.scrollY || document.documentElement.scrollTop;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / DURATION);
      const y = startY - delta * easeOutQuad(p);
      window.scrollTo(0, y);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const toggleExpand = () => {
    const wrapper = wrapperRef.current;
    const list = listRef.current;
    if (!wrapper || !list) {
      setIsExpanded((v) => !v);
      return;
    }

    const startH = wrapper.getBoundingClientRect().height;
    wrapper.style.height = `${startH}px`;
    wrapper.classList.add(styles.animating);
    void wrapper.offsetHeight;

    if (!isExpanded) {
      setIsExpanded(true);
      requestAnimationFrame(() => {
        const endH = wrapper.scrollHeight;
        wrapper.style.height = `${endH}px`;
      });
      const onEnd = (e) => {
        if (e.propertyName !== "height") return;
        wrapper.classList.remove(styles.animating);
        wrapper.style.height = "";
        wrapper.removeEventListener("transitionend", onEnd);
      };
      wrapper.addEventListener("transitionend", onEnd);
      return;
    }

    const targetIndex = Math.min(previewCount, list.children.length) - 1;
    const targetRow =
      targetIndex >= 0 ? list.children[targetIndex] : list.lastElementChild;
    const wrapperTop = wrapper.getBoundingClientRect().top;
    const endH = targetRow
      ? targetRow.getBoundingClientRect().bottom - wrapperTop
      : 0;

    const delta = startH - endH;
    smoothFollow(delta);

    requestAnimationFrame(() => {
      wrapper.style.height = `${endH}px`;
    });

    const onEnd = (e) => {
      if (e.propertyName !== "height") return;
      wrapper.removeEventListener("transitionend", onEnd);

      wrapper.style.height = `${endH}px`;

      flushSync(() => setIsExpanded(false));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.classList.remove(styles.animating);
          wrapper.style.height = "";
        });
      });
    };
    wrapper.addEventListener("transitionend", onEnd);
  };
  const visibleModules = isExpanded ? modules : modules.slice(0, previewCount);

  return (
    <section className={styles.programSection} id="program" ref={sectionRef}>
      <span className={styles.hLine} />
      <div className={styles.columns}>
        <div className={styles.stickyColumn}>
          {/* твой заголовок как был */}
          <h2 className={styles.title}>
            <span className={styles.titleDesktop}>
              {renderTitleLines(titleDesktopLines)}
            </span>

            <span className={styles.titleTablet}>
              {renderTitleLines(titleTabletLines)}
            </span>
          </h2>
        </div>

        <div className={styles.contentColumn}>
          {/* абзацы */}
          {paragraphBlocks.map((para, idx) => (
            <p className={styles.paragraph} key={`para-${idx}`}>
              {renderParagraphLines(para.lines || [])}
              {para.highlight && <span> {para.highlight}</span>}
            </p>
          ))}

          {/* обёртка с анимируемой высотой */}
          <div ref={wrapperRef} className={styles.moduleWrapper}>
            <ul ref={listRef} className={styles.moduleList}>
              {visibleModules.map((item, i) => {
                const idx = i; // индекс внутри текущего (видимого) списка
                const opened = openedIdx === idx;

                return (
                  <li
                    key={`${i}-${item.title}`}
                    className={`${styles.moduleItem} ${
                      opened ? styles.open : ""
                    }`}
                    ref={(el) => (rowRefs.current[idx] = el)}
                  >
                    <button
                      className={styles.rowBtn}
                      onClick={() => toggleRow(idx)}
                    >
                      <div className={styles.leftPart}>
                        <span className={styles.index}>
                          /{String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={styles.moduleTitle}>{item.title}</span>
                      </div>
                      <span className={styles.iconBtn}>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={styles.icon}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.95 1.05L1.05 10.95M10.95 1.05V10.95M10.95 1.05H1.05"
                            stroke="#0EFEF2"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    <div className={styles.answerWrapper}>
                      <p className={styles.answer}>{item.answer}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* кнопка */}
          <div className={styles.fullRow} onClick={toggleExpand}>
            <button className={styles.fullTextBtn}>
              {isExpanded
                ? buttonLabels.collapse || "Hide program"
                : buttonLabels.expand || "The whole program"}
            </button>
            <button
              className={`${styles.fullArrowBtn} ${
                isExpanded ? styles.rotated : ""
              }`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.95 1.05L1.05 10.95M10.95 1.05V10.95M10.95 1.05H1.05"
                  stroke="#0EFEF2"
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
