interface SecondHalfAdGateModalProps {
  locale: "nl" | "en";
  onContinue: () => void;
}

export function SecondHalfAdGateModal({
  locale,
  onContinue,
}: SecondHalfAdGateModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(4,8,20,0.78)] p-4 sm:items-center">
      <div className="glass w-full max-w-xl rounded-[1.8rem] border border-[rgba(228,197,106,0.18)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--gold-soft)]">
              {locale === "nl" ? "Advertentieruimte" : "Ad space"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {locale === "nl" ? "Voor je verdergaat naar helft twee" : "Before you continue to the second half"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-white"
          >
            {locale === "nl" ? "Sluiten" : "Close"}
          </button>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-dashed border-[rgba(228,197,106,0.28)] bg-[linear-gradient(180deg,rgba(228,197,106,0.08),rgba(255,255,255,0.02))] p-5">
          <div className="flex min-h-40 items-center justify-center rounded-[1.1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(7,10,28,0.38)] px-5 text-center">
            <div>
              <p className="text-lg font-semibold text-white">
                {locale === "nl" ? "Advertentieplaceholder" : "Ad placeholder"}
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
                {locale === "nl"
                  ? "Hier kan later een echte advertentie worden geladen. Als er niets beschikbaar is, kun je gewoon verder naar de tweede seizoenshelft."
                  : "A real ad can be loaded here later. If nothing is available, you can simply continue to the second half."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-5 py-3 text-sm font-semibold text-[#171b3a] transition hover:brightness-105"
          >
            {locale === "nl" ? "Verder naar tweede seizoenshelft" : "Continue to the second half"}
          </button>
        </div>
      </div>
    </div>
  );
}
