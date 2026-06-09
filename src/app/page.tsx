import { HomePageClient } from "@/components/HomePageClient";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

const title = "Voetbaldraft.app | Bouw je ultieme Eredivisie XI";
const description =
  "Speel Voetbaldraft.app, draft historische Eredivisie-spelers, bouw je ultieme XI en simuleer het seizoen. Pak jij de schaal of ga je zelfs 34-0-0?";
const ogDescription =
  "Draft historische Eredivisie-spelers, bouw je droomelftal en simuleer het seizoen. Kan jouw XI 34-0-0 gaan?";
const twitterDescription =
  "Draft historische Eredivisie-spelers en simuleer het seizoen. Pak jij de schaal of ga je 34-0-0?";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description: ogDescription,
    type: "website",
    url: SITE_URL,
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
    title,
    description: twitterDescription,
    images: [`${SITE_URL}/og-image.png`],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Voetbaldraft.app",
    url: SITE_URL,
    inLanguage: "nl-NL",
    description:
      "Voetbaldraft.app is een historische Eredivisie draftgame waarin je spelers draft, een ultieme XI bouwt en een seizoen simuleert.",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Voetbaldraft.app",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    url: SITE_URL,
    inLanguage: "nl-NL",
    description:
      "Gratis browsergame waarin je historische Eredivisie-spelers draft, een droomelftal bouwt en jaagt op een perfect 34-0-0 seizoen.",
  },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageClient />
    </>
  );
}
