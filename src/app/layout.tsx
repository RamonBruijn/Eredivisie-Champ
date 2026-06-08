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
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "VoetbalDraft social preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <meta name="google-adsense-account" content="ca-pub-6871463419775181" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6871463419775181"
          crossOrigin="anonymous"
        />
      </head>
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
