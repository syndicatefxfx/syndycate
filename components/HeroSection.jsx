"use client";
import styles from "@/styles/HeroSection.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [arrowUp, setArrowUp] = useState(false);
  const { language } = useLanguage();
  const [heroData, setHeroData] = useState(null);
  const supabaseClient = useMemo(
    () => createBrowserSupabaseClient(),
    []
  );

  useEffect(() => {
    const targetDate = new Date("2026-03-01T00:00:00");
    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, minutes });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;

    supabaseClient
      .from("hero_sections")
      .select(
        `
          timer_label,
          timer_days_label,
          timer_hours_label,
          timer_minutes_label,
          heading_top,
          heading_highlight_first,
          heading_highlight_second,
          heading_bottom,
          subheading_lines,
          cta
        `
      )
      .eq("locale", language)
      .eq("status", "published")
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("[Hero] supabase error", error.message || error);
          return;
        }
        const record = data?.[0];
        if (record) {
          setHeroData(record);
        } else {
          console.warn("[Hero] no hero record for locale", language);
        }
      });
  }, [language, supabaseClient]);

  const timerCopy = {
    label: heroData?.timer_label ?? "Time until start:",
    days: heroData?.timer_days_label ?? "D",
    hours: heroData?.timer_hours_label ?? "H",
    minutes: heroData?.timer_minutes_label ?? "M",
  };

  const headingCopy = {
    topLine: heroData?.heading_top ?? "",
    highlightLines: [
      heroData?.heading_highlight_first ?? "",
      heroData?.heading_highlight_second ?? "",
    ],
    bottomLine: heroData?.heading_bottom ?? "",
  };

  const [highlightFirst = "", highlightSecond = ""] =
    headingCopy.highlightLines ?? [];
  const subheadingLines = heroData?.subheading_lines ?? [];
  const ctaText = heroData?.cta ?? "";

  useEffect(() => {
    const target = document.getElementById("next");
    if (!target) {
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => setArrowUp(entry.isIntersecting),
      {
        threshold: 0.05,
        rootMargin: `-${EXTRA_OFFSET}px 0px 0px 0px`, //
      }
    );

    io.observe(target);
    return () => io.disconnect();
  }, []);

  const EXTRA_OFFSET = 150;

  const scrollToNext = () => {
    const el = document.getElementById("next");
    if (!el) return;

    const offsetTop =
      el.getBoundingClientRect().top + window.scrollY + EXTRA_OFFSET; //

    window.scrollTo({ top: offsetTop, behavior: "smooth" });
  };

  const goTo = useCallback((id) => {
    const el = document.getElementById(id) || document.querySelector(id);
    if (!el) return;

    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.timerWrapper}>
        <svg
          width="29"
          height="110"
          viewBox="0 0 29 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="curveLeft"
        >
          <path
            d="M0.839844 55.9091V53.1818C5.75462 53.1534 9.07848 52.2727 10.8114 50.5398C12.5728 48.7784 13.4535 45.4546 13.4535 40.5682V18.2386C13.4535 15.142 13.766 12.4574 14.391 10.1847C15.016 7.88353 15.9677 5.98012 17.2461 4.47443C18.5245 2.96875 20.1296 1.84659 22.0614 1.10796C24.0217 0.36932 26.3228 0 28.9648 0V2.72728C26.0103 2.69887 23.5813 3.22443 21.6779 4.30398C19.8029 5.38352 18.4109 7.07386 17.5018 9.375C16.6211 11.6477 16.1808 14.6023 16.1808 18.2386V40.5682C16.1808 43.3807 15.9109 45.767 15.3711 47.7273C14.8313 49.6591 13.9648 51.2358 12.7717 52.4574C11.5785 53.6506 10.0018 54.5313 8.04155 55.0994C6.08132 55.6392 3.68075 55.9091 0.839844 55.9091ZM28.9648 109.091C26.3228 109.091 24.0217 108.722 22.0614 107.983C20.1296 107.244 18.5245 106.122 17.2461 104.616C15.9677 103.111 15.016 101.207 14.391 98.9063C13.766 96.6335 13.4535 93.9489 13.4535 90.8523V68.5227C13.4535 63.6364 12.5728 60.3267 10.8114 58.5938C9.07848 56.8324 5.75462 55.9375 0.839844 55.9091V53.1818C3.68075 53.2102 6.08132 53.5085 8.04155 54.0767C10.0018 54.6165 11.5785 55.483 12.7717 56.6761C13.9648 57.8693 14.8313 59.446 15.3711 61.4063C15.9109 63.3381 16.1808 65.7102 16.1808 68.5227V90.8523C16.1808 94.4886 16.6211 97.4432 17.5018 99.7159C18.4109 102.017 19.8029 103.693 21.6779 104.744C23.5813 105.824 26.0103 106.364 28.9648 106.364V109.091ZM0.839844 55.9091V53.1818H10.0444V55.9091H0.839844Z"
            fill="#272727"
          />
        </svg>

        <div className={styles.timer}>
          <div>{timerCopy.label ?? ""}</div>
          <div className={styles.timerValue}>
            {String(timeLeft.days).padStart(2, "0")}
            <span className={styles.gray}>D</span>:
            {String(timeLeft.hours).padStart(2, "0")}
            <span className={styles.gray}>H</span>:
            {String(timeLeft.minutes).padStart(2, "0")}
            <span className={styles.gray}>M</span>
          </div>
        </div>

        <svg
          width="29"
          height="110"
          viewBox="0 0 29 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="curveRight"
        >
          <path
            d="M29 53.1818V55.9091C24.0852 55.9375 20.7472 56.8324 18.9858 58.5938C17.2528 60.3267 16.3864 63.6364 16.3864 68.5227V90.8523C16.3864 93.9489 16.0739 96.6335 15.4489 98.9063C14.8239 101.207 13.8722 103.111 12.5938 104.616C11.3153 106.122 9.69602 107.244 7.7358 107.983C5.80398 108.722 3.51705 109.091 0.875 109.091V106.364C3.85795 106.364 6.28693 105.824 8.16193 104.744C10.0369 103.693 11.4148 102.017 12.2955 99.7159C13.2045 97.4432 13.6591 94.4886 13.6591 90.8523V68.5227C13.6591 65.7102 13.929 63.3381 14.4688 61.4063C15.0085 59.446 15.875 57.8693 17.0682 56.6761C18.2614 55.4546 19.8381 54.5739 21.7983 54.0341C23.7585 53.4659 26.1591 53.1818 29 53.1818ZM0.875 0C3.51705 0 5.80398 0.36932 7.7358 1.10796C9.69602 1.84659 11.3153 2.96875 12.5938 4.47443C13.8722 5.98012 14.8239 7.88353 15.4489 10.1847C16.0739 12.4574 16.3864 15.142 16.3864 18.2386V40.5682C16.3864 45.4546 17.2528 48.7784 18.9858 50.5398C20.7472 52.2727 24.0852 53.1534 29 53.1818V55.9091C26.1591 55.8807 23.7585 55.5966 21.7983 55.0568C19.8381 54.4886 18.2614 53.608 17.0682 52.4148C15.875 51.2216 15.0085 49.6591 14.4688 47.7273C13.929 45.767 13.6591 43.3807 13.6591 40.5682V18.2386C13.6591 14.6023 13.2045 11.6477 12.2955 9.375C11.4148 7.07386 10.0369 5.38352 8.16193 4.30398C6.28693 3.22443 3.85795 2.69887 0.875 2.72728V0ZM29 53.1818V55.9091H19.7955V53.1818H29Z"
            fill="#272727"
          />
        </svg>
      </div>

      <div className={styles.scrollUnderTimer}>
        <button onClick={scrollToNext} className={styles.scrollBtn}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            className={arrowUp ? styles.up : ""}
          >
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
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>
          {headingCopy.topLine}
          <span className={styles.cryptoIcons}>
            <svg
              width="219"
              height="73"
              viewBox="0 0 219 73"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M34.2188 23.8672C31.3718 24.6459 29.6562 26.8328 29.6562 28.8951C29.6562 30.9573 31.3718 33.1443 34.2188 33.9199V23.8672ZM38.7812 39.0786V49.1282C41.6283 48.3526 43.3438 46.1656 43.3438 44.1034C43.3438 42.0411 41.6283 39.8542 38.7812 39.0786Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M66.9154 36.5026C66.9154 53.3017 53.2978 66.9193 36.4987 66.9193C19.6996 66.9193 6.08203 53.3017 6.08203 36.5026C6.08203 19.7035 19.6996 6.08594 36.4987 6.08594C53.2978 6.08594 66.9154 19.7035 66.9154 36.5026ZM36.4987 15.9714C37.1037 15.9714 37.684 16.2117 38.1118 16.6395C38.5396 17.0673 38.7799 17.6476 38.7799 18.2526V19.2168C43.7379 20.105 47.9049 23.831 47.9049 28.8984C47.9049 29.5035 47.6646 30.0837 47.2368 30.5115C46.809 30.9393 46.2287 31.1797 45.6237 31.1797C45.0187 31.1797 44.4384 30.9393 44.0106 30.5115C43.5828 30.0837 43.3424 29.5035 43.3424 28.8984C43.3424 26.8362 41.6269 24.6492 38.7799 23.8706V34.4251C43.7379 35.3133 47.9049 39.0394 47.9049 44.1068C47.9049 49.1742 43.7379 52.9002 38.7799 53.7884V54.7526C38.7799 55.3576 38.5396 55.9379 38.1118 56.3657C37.684 56.7935 37.1037 57.0339 36.4987 57.0339C35.8937 57.0339 35.3134 56.7935 34.8856 56.3657C34.4578 55.9379 34.2174 55.3576 34.2174 54.7526V53.7884C29.2595 52.9002 25.0924 49.1742 25.0924 44.1068C25.0924 43.5017 25.3328 42.9215 25.7606 42.4937C26.1884 42.0659 26.7687 41.8255 27.3737 41.8255C27.9787 41.8255 28.559 42.0659 28.9868 42.4937C29.4146 42.9215 29.6549 43.5017 29.6549 44.1068C29.6549 46.169 31.3704 48.356 34.2174 49.1316V38.5801C29.2595 37.6919 25.0924 33.9659 25.0924 28.8984C25.0924 23.831 29.2595 20.105 34.2174 19.2168V18.2526C34.2174 17.6476 34.4578 17.0673 34.8856 16.6395C35.3134 16.2117 35.8937 15.9714 36.4987 15.9714Z"
                fill="white"
              />
              <circle cx="109.499" cy="36.5026" r="30.4167" fill="#1E1E1E" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M109.499 66.9193C126.298 66.9193 139.915 53.3017 139.915 36.5026C139.915 19.7035 126.298 6.08594 109.499 6.08594C92.6996 6.08594 79.082 19.7035 79.082 36.5026C79.082 53.3017 92.6996 66.9193 109.499 66.9193ZM93.5299 36.5026C93.5299 35.726 93.5837 34.9655 93.6912 34.2214H103.415C104.02 34.2214 104.601 33.981 105.028 33.5532C105.456 33.1254 105.697 32.5451 105.697 31.9401C105.697 31.3351 105.456 30.7548 105.028 30.327C104.601 29.8992 104.02 29.6589 103.415 29.6589H95.066C96.0108 27.6651 97.3584 25.8888 99.024 24.442C100.69 22.9951 102.637 21.909 104.743 21.2523C106.849 20.5956 109.069 20.3824 111.261 20.6262C113.454 20.8701 115.573 21.5657 117.483 22.6691C117.743 22.8213 118.03 22.9206 118.328 22.9613C118.626 23.0021 118.929 22.9835 119.22 22.9066C119.511 22.8297 119.784 22.696 120.023 22.5133C120.261 22.3305 120.462 22.1023 120.612 21.8418C120.763 21.5812 120.86 21.2935 120.899 20.9951C120.938 20.6968 120.917 20.3937 120.838 20.1034C120.76 19.8131 120.624 19.5412 120.44 19.3034C120.255 19.0656 120.026 18.8667 119.764 18.718C117.153 17.2121 114.243 16.2993 111.24 16.0444C108.236 15.7894 105.214 16.1985 102.386 17.2427C99.5589 18.2869 96.9959 19.9405 94.8792 22.0863C92.7625 24.2321 91.144 26.8174 90.1385 29.6589H88.207C87.602 29.6589 87.0218 29.8992 86.5939 30.327C86.1661 30.7548 85.9258 31.3351 85.9258 31.9401C85.9258 32.5451 86.1661 33.1254 86.5939 33.5532C87.0218 33.981 87.602 34.2214 88.207 34.2214H89.0922C88.9239 35.7375 88.9239 37.2677 89.0922 38.7839H88.207C87.602 38.7839 87.0218 39.0242 86.5939 39.452C86.1661 39.8798 85.9258 40.4601 85.9258 41.0651C85.9258 41.6701 86.1661 42.2504 86.5939 42.6782C87.0218 43.106 87.602 43.3464 88.207 43.3464H90.1354C91.1411 46.1884 92.76 48.7742 94.8773 50.9203C96.9946 53.0663 99.5583 54.72 102.386 55.764C105.215 56.8079 108.238 57.2166 111.242 56.9608C114.246 56.7051 117.156 55.7912 119.767 54.2842C120.034 54.138 120.269 53.9401 120.458 53.702C120.647 53.4639 120.786 53.1904 120.868 52.8976C120.95 52.6048 120.972 52.2986 120.934 51.997C120.896 51.6954 120.798 51.4045 120.645 51.1414C120.493 50.8782 120.29 50.6482 120.047 50.4647C119.805 50.2813 119.528 50.1481 119.234 50.0731C118.939 49.9981 118.632 49.9827 118.332 50.0279C118.031 50.073 117.743 50.1778 117.483 50.3361C115.573 51.4395 113.454 52.1351 111.261 52.379C109.069 52.6228 106.849 52.4096 104.743 51.7529C102.637 51.0962 100.69 50.0101 99.024 48.5633C97.3584 47.1164 96.0108 45.3401 95.066 43.3464H103.415C104.02 43.3464 104.601 43.106 105.028 42.6782C105.456 42.2504 105.697 41.6701 105.697 41.0651C105.697 40.4601 105.456 39.8798 105.028 39.452C104.601 39.0242 104.02 38.7839 103.415 38.7839H93.6912C93.5802 38.0286 93.5264 37.266 93.5299 36.5026Z"
                fill="white"
              />
              <g clipPath="url(#clip0_500_2206)">
                <path
                  d="M182.499 6.08594C176.483 6.08594 170.602 7.86984 165.6 11.2121C160.598 14.5543 156.7 19.3047 154.397 24.8626C152.095 30.4206 151.493 36.5363 152.666 42.4366C153.84 48.3368 156.737 53.7566 160.991 58.0104C165.245 62.2643 170.664 65.1612 176.565 66.3348C182.465 67.5084 188.581 66.9061 194.139 64.6039C199.697 62.3018 204.447 58.4032 207.789 53.4012C211.131 48.3992 212.915 42.5184 212.915 36.5026C212.915 28.4356 209.711 20.699 204.007 14.9948C198.302 9.29054 190.566 6.08594 182.499 6.08594ZM194.855 55.3609H170.598C170.005 55.3596 169.434 55.1367 168.997 54.7359C168.56 54.335 168.289 53.7853 168.236 53.1946C168.184 52.6039 168.354 52.015 168.714 51.5435C169.074 51.072 169.596 50.752 170.18 50.6463C170.465 50.6463 173.45 49.7148 173.45 43.9167V38.4036H168.697C168.193 38.4036 167.709 38.2034 167.353 37.8468C166.996 37.4903 166.796 37.0068 166.796 36.5026C166.796 35.9984 166.996 35.5149 167.353 35.1584C167.709 34.8018 168.193 34.6016 168.697 34.6016H173.45V24.8682C173.412 23.4045 173.663 21.9478 174.19 20.5815C174.716 19.2153 175.507 17.9664 176.518 16.9067C177.528 15.8469 178.738 14.9971 180.077 14.4059C181.417 13.8148 182.86 13.494 184.324 13.462C185.843 13.4734 187.343 13.8082 188.723 14.4441C190.103 15.08 191.331 16.0024 192.327 17.15C192.538 17.3834 192.701 17.6561 192.807 17.9525C192.912 18.2489 192.958 18.5631 192.942 18.8774C192.926 19.1916 192.849 19.4996 192.714 19.7838C192.579 20.068 192.389 20.3229 192.156 20.5339C191.923 20.7448 191.65 20.9077 191.354 21.0133C191.057 21.1189 190.743 21.165 190.429 21.1491C190.114 21.1332 189.806 21.0556 189.522 20.9207C189.238 20.7858 188.983 20.5962 188.772 20.3628C188.233 19.7257 187.564 19.2113 186.81 18.8539C186.056 18.4965 185.234 18.3045 184.4 18.2906C182.717 18.355 181.128 19.0832 179.981 20.3158C178.834 21.5485 178.222 23.1853 178.278 24.8682V34.6016H183.982C184.486 34.6016 184.969 34.8018 185.326 35.1584C185.682 35.5149 185.883 35.9984 185.883 36.5026C185.883 37.0068 185.682 37.4903 185.326 37.8468C184.969 38.2034 184.486 38.4036 183.982 38.4036H178.278V43.9167C178.324 46.2335 177.816 48.5278 176.796 50.6083H194.855C195.486 50.6083 196.09 50.8587 196.536 51.3043C196.981 51.75 197.232 52.3544 197.232 52.9846C197.232 53.6149 196.981 54.2193 196.536 54.6649C196.09 55.1106 195.486 55.3609 194.855 55.3609Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_500_2206">
                  <rect
                    width="73"
                    height="73"
                    fill="white"
                    transform="translate(146)"
                  />
                </clipPath>
              </defs>
            </svg>
          </span>
          <br />
          <span className={styles.blue}>
            {highlightFirst}
            <br />
            {highlightSecond}
          </span>
          <br />
          {headingCopy.bottomLine}
        </h1>

        <div className={styles.footerRow}>
          <div className={styles.scrollDown}>
            <button onClick={scrollToNext} className={styles.scrollBtn}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className={arrowUp ? styles.up : ""}
              >
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

          <div className={styles.bottomRight}>
            <p>
              {subheadingLines.map((line, idx) => (
                <span key={`${line}-${idx}`}>
                  {line}
                  {idx < subheadingLines.length - 1 && <br />}
                </span>
              ))}
            </p>
            <div className={styles.signIn}>
              <button
                className={styles.signInText}
                onClick={() => goTo("tariffs")}
              >
                {ctaText}
              </button>
              <button
                className={styles.signInArrow}
                onClick={() => goTo("tariffs")}
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
      </div>
      <div className={styles.graphBg}>
        <svg
          viewBox="0 0 1920 769"
          className={styles.graphSvg}
          xmlns="http://www.w3.org/2000/svg"
        >
          <svg
            width="1920"
            height="769"
            viewBox="0 0 1920 769"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.6">
              <g filter="url(#filter0_i_106_2291)">
                <path
                  d="M60.902 538.561L-27 571.659V784H1957V10L1889.78 126.609L1773.44 190.77L1678.82 126.609L1573.33 217.758L1410.46 228.451L1345.31 294.649L1308.59 349.643L1249.13 330.803L1204.66 378.159L1134.34 365.429L1072.29 463.197L987.493 451.995L865.981 563.512L800.313 599.666L651.914 524.303L573.836 492.732L426.988 546.199L274.969 505.462L254.286 538.561L211.37 505.462L173.106 590.5L60.902 538.561Z"
                  fill="url(#paint0_linear_106_2291)"
                  fillOpacity="0.2"
                />
              </g>

              <path
                d="M60.902 538.561L-27 571.659V784H1957V10L1889.78 126.609L1773.44 190.77L1678.82 126.609L1573.33 217.758L1410.46 228.451L1345.31 294.649L1308.59 349.643L1249.13 330.803L1204.66 378.159L1134.34 365.429L1072.29 463.197L987.493 451.995L865.981 563.512L800.313 599.666L651.914 524.303L573.836 492.732L426.988 546.199L274.969 505.462L254.286 538.561L211.37 505.462L173.106 590.5L60.902 538.561Z"
                stroke="url(#paint1_linear_106_2291)"
                strokeWidth="5"
              />
            </g>

            <defs>
              <filter
                id="filter0_i_106_2291"
                x="-29.5"
                y="0.658203"
                width="1989"
                height="789.842"
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
                  result="effect1_innerShadow_106_2291"
                />
              </filter>
              <linearGradient
                id="paint0_linear_106_2291"
                x1="965"
                y1="10"
                x2="965"
                y2="784"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0EDAFE" />
                <stop offset="1" stopColor="#0A0A0A" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_106_2291"
                x1="1907.4"
                y1="110.824"
                x2="-23.3896"
                y2="620.473"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#0EDAFE" />
                <stop offset="0.264939" stopColor="#0EDAFE" />
                <stop offset="0.329122" stopColor="#0A0A0A" />
                <stop offset="0.421732" stopColor="#0A0A0A" />
                <stop offset="0.536866" stopColor="#0EDAFE" />
                <stop offset="0.612627" stopColor="#0A0A0A" />
                <stop offset="0.83627" stopColor="#0A0A0A" />
                <stop offset="0.91451" stopColor="#0A0A0A" />
                <stop offset="0.935155" stopColor="#0EDAFE" />
                <stop offset="0.943868" stopColor="#0A0A0A" />
                <stop offset="1" stopColor="#088298" />
              </linearGradient>
            </defs>
          </svg>
        </svg>
      </div>

      <div className={styles.dashLines}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={styles.dashLine}
            style={{ left: `${812 + i * 152}px` }}
          />
        ))}
      </div>
    </section>
  );
}
