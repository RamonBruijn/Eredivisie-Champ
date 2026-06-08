import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eredivisie Champ",
  description: "Build a historic Eredivisie all-time XI and chase 34-0.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <I18nProvider>
          {children}
          <div className="joop-footer">
            <div className="joop-footer-links">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacybeleid">Privacybeleid</Link>
              <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
            </div>
            <div className="prod-by-joop">ProdByJoopKarnemelk</div>
            <a
              href="https://ko-fi.com/joopkarnemelk"
              target="_blank"
              rel="noreferrer"
              className="joop-support-link"
            >
              Joop&apos;s biertegoed
            </a>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
