"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.03)] p-1 text-sm">
      <span className="px-2 text-[var(--muted)]">{t.common.language}</span>
      <button
        type="button"
        onClick={() => setLocale("nl")}
        className={`rounded-full px-3 py-1 ${locale === "nl" ? "bg-[var(--gold)] text-[#102019]" : "text-[var(--muted)]"}`}
      >
        {t.common.dutch}
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-[var(--gold)] text-[#102019]" : "text-[var(--muted)]"}`}
      >
        {t.common.english}
      </button>
    </div>
  );
}
