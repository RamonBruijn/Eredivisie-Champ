 "use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className="page-shell">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 md:py-16">
        <div className="glass max-w-4xl rounded-[2rem] p-5 sm:p-8 md:rounded-[2.5rem] md:p-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold-soft)]">{t.home.eyebrow}</p>
            <LanguageToggle />
          </div>
          <div className="mt-5 flex items-end gap-2 sm:gap-3">
            <span className="text-5xl font-bold leading-none text-white sm:text-7xl">34</span>
            <span className="mb-1 text-3xl font-semibold text-[var(--gold-soft)] sm:text-5xl">–</span>
            <span className="text-5xl font-bold leading-none text-white sm:text-7xl">0</span>
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold leading-[0.96] text-white sm:text-5xl md:text-7xl">
            {t.home.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)] md:mt-6 md:text-lg">
            {t.home.description}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/game"
              className="rounded-[1.3rem] bg-[linear-gradient(180deg,var(--gold-soft),var(--gold))] px-6 py-4 text-center text-base font-semibold text-[#171b3a] shadow-[0_16px_40px_rgba(0,0,0,0.22)] transition hover:brightness-105"
            >
              {t.home.start}
            </Link>
            <div className="rounded-[1.3rem] border border-[var(--line)] px-5 py-4 text-sm text-[var(--muted)]">
              {t.home.subtitle}
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-4">
            <Blurb title={t.home.blurb1Title} body={t.home.blurb1Body} />
            <Blurb title={t.home.blurb2Title} body={t.home.blurb2Body} />
            <Blurb title={t.home.blurb3Title} body={t.home.blurb3Body} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Blurb({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-4 md:rounded-[1.75rem] md:p-5">
      <h2 className="text-base font-semibold text-white md:text-lg">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
