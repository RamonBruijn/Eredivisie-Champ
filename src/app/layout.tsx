import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
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
