"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, startOfDay, isBefore, isToday } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import styles from "./DatePicker.module.css";

const parseDate = (dateString, lang) => {
  if (!dateString) return null;
  try {
    if (lang === "en") {
      const parsed = parse(dateString, "yyyy-MM-dd", new Date());
      return isNaN(parsed.getTime()) ? null : parsed;
    } else {
      const parsed = parse(dateString, "dd.MM.yyyy", new Date());
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  } catch {
    return null;
  }
};

const formatDate = (date, lang) => {
  if (!date) return "";
  try {
    if (lang === "en") {
      return format(date, "yyyy-MM-dd");
    } else {
      return format(date, "dd.MM.yyyy");
    }
  } catch {
    return "";
  }
};

export default function DatePicker({
  value,
  onChange,
  language = "en",
  placeholder,
  minDate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      const parsed = parseDate(value, language);
      return parsed || null;
    }
    return null;
  });
  const containerRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    if (value) {
      const parsed = parseDate(value, language);
      setSelectedDate(parsed || null);
    } else {
      setSelectedDate(null);
    }
  }, [value, language]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const updateCalendarPosition = () => {
      if (isOpen && containerRef.current && calendarRef.current) {
        const inputRect = containerRef.current.getBoundingClientRect();
        const calendar = calendarRef.current;
        const calendarHeight = calendar.offsetHeight || 350; // примерная высота календаря
        // Позиционируем над инпутом
        calendar.style.top = `${
          inputRect.top + window.scrollY - calendarHeight - 8
        }px`;
        calendar.style.left = `${inputRect.left + window.scrollX}px`;
      }
    };

    if (isOpen) {
      updateCalendarPosition();
      window.addEventListener("scroll", updateCalendarPosition, true);
      window.addEventListener("resize", updateCalendarPosition);
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        window.removeEventListener("scroll", updateCalendarPosition, true);
        window.removeEventListener("resize", updateCalendarPosition);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleDateSelect = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const formatted = formatDate(date, language);
    onChange(formatted);
    setIsOpen(false);
  };

  const displayValue = selectedDate ? formatDate(selectedDate, language) : "";

  const locale = language === "ru" ? ru : enUS;
  const today = startOfDay(new Date());
  const min = minDate || today;

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrapper} onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          value={displayValue}
          readOnly
          placeholder={placeholder}
          className={styles.input}
        />
        <svg
          className={styles.calendarIcon}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 2V4M14 2V4M3 8H17M4 4H16C16.5523 4 17 4.44772 17 5V16C17 16.5523 16.5523 17 16 17H4C3.44772 17 3 16.5523 3 16V5C3 4.44772 3.44772 4 4 4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {isOpen && (
        <div className={styles.calendarWrapper} ref={calendarRef}>
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={locale}
            disabled={(date) => isBefore(startOfDay(date), min)}
            fromDate={min}
            modifiersClassNames={{
              today: styles.today,
              selected: styles.selected,
              disabled: styles.disabled,
            }}
            classNames={{
              months: styles.months,
              month: styles.month,
              caption: styles.caption,
              caption_label: styles.captionLabel,
              nav: styles.nav,
              nav_button: styles.navButton,
              nav_button_previous: styles.navButtonPrevious,
              nav_button_next: styles.navButtonNext,
              table: styles.table,
              head_row: styles.headRow,
              head_cell: styles.headCell,
              row: styles.row,
              cell: styles.cell,
              day: styles.day,
              day_button: styles.dayButton,
            }}
          />
        </div>
      )}
    </div>
  );
}
