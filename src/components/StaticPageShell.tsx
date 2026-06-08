import Link from "next/link";
import type { ReactNode } from "react";

interface StaticPageShellProps {
  title: string;
  intro: string;
  children: ReactNode;
}

export function StaticPageShell({ title, intro, children }: StaticPageShellProps) {
  return (
    <main className="page-shell mx-auto min-h-screen max-w-4xl px-4 py-8 sm:px-6 md:py-14">
      <section className="glass rounded-[2rem] p-6 sm:p-8 md:rounded-[2.5rem] md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--gold-soft)]">Eredivisie Champ</p>
          <Link
            href="/"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] transition hover:bg-[rgba(255,255,255,0.04)] hover:text-white"
          >
            Terug naar home
          </Link>
        </div>

        <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{intro}</p>

        <div className="mt-8 space-y-6 text-[15px] leading-7 text-[var(--text)]">{children}</div>
      </section>
    </main>
  );
}
