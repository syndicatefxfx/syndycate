"use client";
import { useMemo, useState } from "react";
import styles from "@/styles/TariffForm.module.css";
import { downloadPrivacyPolicy } from "@/lib/downloadUtils";
import CustomSelect from "./CustomSelect";
import { useDictionary } from "./LanguageProvider";
import SuccessModal from "./SuccessModal";

export default function TariffForm({ tariff, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState("");
  const [accept, setAccept] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formCopy = useDictionary().participation?.form ?? {};
  const placeholders = formCopy.placeholders ?? {};
  const contactOptions = formCopy.contactOptions ?? [
    { value: "call", label: "CALL ME" },
    { value: "telegram", label: "TELEGRAM" },
    { value: "whatsapp", label: "WHATSAPP" },
  ];
  const checkboxCopy = formCopy.checkbox ?? {};
  const supportCopy = formCopy.support ?? {};
  const ctaCopy = formCopy.cta ?? {};

  const detailsPlaceholder = useMemo(() => {
    if (method === "telegram") return placeholders.telegram || "";
    if (method === "call") return placeholders.call || "";
    if (method === "whatsapp") return placeholders.whatsapp || "";
    return "";
  }, [method, placeholders]);

  const canSubmit =
    !!name.trim() && !!method && !!details.trim() && accept && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSending(true);

      const payload = {
        plan: tariff?.title,
        mode: tariff?.mode,
        name,
        method,
        details,
        accept,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        console.error("Sheets error:", data.error);
        alert("Не удалось отправить. Проверь URL GAS и права доступа.");
        return;
      }

      await onSubmit?.(payload);
      setShowSuccess(true);
    } finally {
      setSending(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose?.();
  };

  return (
    <>
      {showSuccess && <SuccessModal onClose={handleSuccessClose} />}
      <div className={styles.modalGrid} role="document">
        {/* LEFT */}
        <div className={styles.leftCol}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.headings}>
              <h3 className={styles.title}>{tariff?.title}</h3>
              <p className={styles.mode}>{tariff?.mode}</p>
            </div>

            <div className={styles.inputsContainer}>
              <input
                className={styles.input}
                placeholder={placeholders.name || "NAME"}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <CustomSelect
                value={method}
                onChange={(val) => {
                  setMethod(val);
                  setDetails("");
                }}
                placeholder={
                  placeholders.contactMethod || "CHOOSE CONTACT METHOD"
                }
                options={contactOptions}
              />
              {!!method && (
                <input
                  className={styles.input}
                  placeholder={detailsPlaceholder}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              )}
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                />

                <span className={styles.cbText}>
                  {checkboxCopy.textBefore || "I ACCEPT THE"}{" "}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={downloadPrivacyPolicy}
                  >
                    {checkboxCopy.privacy || "PRIVACY POLICY"}
                  </button>{" "}
                  {checkboxCopy.textAfter || "AND CONTRACTUAL OFFERS"}
                </span>
              </label>

              <div className={styles.inlineSupport}>
                <span>{supportCopy.text || "OR CONTACT US DIRECTLY"}</span>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() =>
                    window.open(
                      "https://t.me/sndct_supp",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  {supportCopy.link || "SUPPORT"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT */}
        <div className={styles.rightCol}>
          <ul className={styles.list}>
            {(tariff?.bullets ?? []).map((b) => {
              const text = typeof b === "string" ? b : b?.text || "";
              const muted =
                typeof b === "string"
                  ? b.startsWith("NO ") ||
                    b.toLowerCase().includes("not included")
                  : Boolean(b?.muted);
              return (
                <li
                  key={`${tariff?.id || "tariff"}-${text}`}
                  className={`${styles.bullet} ${muted ? styles.muted : ""}`}
                >
                  <span className={styles.bulletIcon}>&lt;</span>
                  {text}
                </li>
              );
            })}
          </ul>

          <div className={styles.extra}>
            <span className={styles.star}>*</span>
            <div className={styles.extraLines}>
              {(tariff?.extra ?? []).map((e) => {
                const text = typeof e === "string" ? e : e?.text || "";
                const mutedExtra =
                  typeof e === "string"
                    ? e.toLowerCase().includes("not included")
                    : Boolean(e?.muted);
                return (
                  <p
                    key={`${tariff?.id || "tariff-extra"}-${text}`}
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

          <div className={styles.bottomRow}>
            <div className={styles.priceWrap}>
              <div>
                {(() => {
                  const price = tariff?.price || "";
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
            <div className={styles.ctaRow}>
              <button
                type="submit"
                className={`${styles.ctaText} ${
                  !canSubmit ? styles.disabled : ""
                }`}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {sending
                  ? ctaCopy.sending || "SENDING..."
                  : tariff?.cta || ctaCopy.default || "RESERVE YOUR SPOT"}
              </button>
              <button
                type="button"
                className={`${styles.ctaArrow} ${
                  !canSubmit ? styles.disabled : ""
                }`}
                disabled={!canSubmit}
                onClick={handleSubmit}
                aria-label="Submit"
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
    </>
  );
}
