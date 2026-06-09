"use client";

import { useEffect, useRef, useState } from "react";

interface SecondHalfAdGateModalProps {
  locale: "nl" | "en";
  onContinue: () => void;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function SecondHalfAdGateModal({
  locale,
  onContinue,
}: SecondHalfAdGateModalProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const canContinue = countdown === 0;
  const continueLabel = canContinue
    ? locale === "nl"
      ? "Verder naar tweede seizoenshelft"
      : "Continue to the second half"
    : locale === "nl"
      ? `Verder over ${countdown}...`
      : `Continue in ${countdown}...`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(4,8,20,0.78)] p-4 sm:items-center">
      <div className="glass w-full max-w-xl rounded-[1.8rem] border border-[rgba(228,197,106,0.18)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {locale === "nl" ? "Advertentie" : "Advertisement"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {locale === "nl" ? "Voor je verdergaat naar helft twee" : "Before you continue to the second half"}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
              {locale === "nl"
                ? "Een korte onderbreking, daarna gaat je seizoensrun direct verder."
                : "A short break, then your season run continues immediately."}
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            {locale === "nl" ? "Sluiten" : "Close"}
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-[rgba(228,197,106,0.18)] bg-[linear-gradient(180deg,rgba(228,197,106,0.06),rgba(255,255,255,0.02))] p-4 sm:p-5">
          <SecondHalfAdSenseSlot locale={locale} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onContinue}
            disabled={!canContinue}
            className="rounded-full bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-semibold text-[#171b3a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SecondHalfAdSenseSlot({ locale }: { locale: "nl" | "en" }) {
  const containerRef = useRef<HTMLModElement | null>(null);
  const hasPushedRef = useRef(false);
  const [adState, setAdState] = useState<"loading" | "fallback">("loading");

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      setAdState("fallback");
    }, 5000);

    try {
      if (!hasPushedRef.current && containerRef.current) {
        hasPushedRef.current = true;
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch {
      setAdState("fallback");
    }

    return () => window.clearTimeout(fallbackTimer);
  }, []);

  return (
    <div className="rounded-[1.1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(7,10,28,0.42)] px-4 py-4 text-center">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          {locale === "nl" ? "Advertentie" : "Advertisement"}
        </p>
        <p className="text-[11px] text-[var(--muted)]">
          {adState === "fallback"
            ? locale === "nl"
              ? "Je kunt verder"
              : "You can continue"
            : locale === "nl"
              ? "Laden..."
              : "Loading..."}
        </p>
      </div>

      <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-[0.95rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(10,14,34,0.86),rgba(7,10,26,0.92))] px-3">
        <ins
          ref={containerRef}
          className="adsbygoogle block min-h-[250px] w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-6871463419775181"
          data-ad-slot="4033371088"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {locale === "nl"
          ? "Een korte pauze voor helft twee. Daarna gaat je seizoensrun direct verder."
          : "A short break before the second half. Then your season run continues immediately."}
      </p>
    </div>
  );
}
