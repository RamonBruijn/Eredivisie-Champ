import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Eredivisie",
    "Eredivisie game",
    "voetbal manager",
    "football draft game",
    "historische Eredivisie",
    "all-time XI",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
