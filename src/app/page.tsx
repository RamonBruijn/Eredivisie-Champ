 "use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <main className="page-shell">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="glass max-w-4xl rounded-[2.5rem] p-8 md:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm uppercase tracking-[0.28em] text-[var(--gold-soft)]">{t.home.eyebrow}</p>
            <LanguageToggle />
          </div>
          <h1 className="mt-4 max-w-3xl text-balance text-5xl font-bold leading-tight text-white md:text-7xl">
            {t.home.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-[var(--muted)]">
            {t.home.description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/game"
              className="rounded-full bg-[var(--gold)] px-6 py-4 text-center font-semibold text-[#102019] transition hover:brightness-105"
            >
              {t.home.start}
            </Link>
            <div className="rounded-full border border-[var(--line)] px-6 py-4 text-sm text-[var(--muted)]">
              {t.home.subtitle}
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
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
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-[rgba(255,255,255,0.02)] p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
    </div>
  );
}
