"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={[
        "inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] text-sm",
        compact ? "gap-1.5 p-0.5 text-xs" : "gap-2 p-1",
        className ?? "",
      ].join(" ")}
    >
      <span className={["text-[var(--muted)]", compact ? "px-1.5" : "px-2"].join(" ")}>{t.common.language}</span>
      <button
        type="button"
        onClick={() => setLocale("nl")}
        className={[
          "rounded-full",
          compact ? "px-2 py-1" : "px-3 py-1",
          locale === "nl" ? "bg-[var(--gold)] text-[#102019]" : "text-[var(--muted)]",
        ].join(" ")}
      >
        {t.common.dutch}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={[
          "rounded-full",
          compact ? "px-2 py-1" : "px-3 py-1",
          locale === "en" ? "bg-[var(--gold)] text-[#102019]" : "text-[var(--muted)]",
        ].join(" ")}
      >
        {t.common.english}
      </button>
    </div>
  );
}
