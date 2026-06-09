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
const faqItems = [
  {
    question: "Wat is Voetbaldraft?",
    answer:
      "Voetbaldraft is een gratis Eredivisie draftgame voor je browser. Je kiest historische spelers uit verschillende teams en seizoenen, bouwt een ultieme XI en laat daarna een volledig seizoen simuleren. Zo probeer je kampioen te worden of zelfs de 34-0-0 challenge te halen.",
  },
  {
    question: "Hoe werkt de draft?",
    answer:
      "De draft werkt door eerst een modus en formatie te kiezen. Daarna selecteer je historische spelers positie voor positie uit de beschikbare teams en bouw je jouw elftal op. Als je XI klaar is, laat je het seizoen simuleren en zie je hoe ver jouw team komt.",
  },
  {
    question: "Kan ik 34-0-0 halen?",
    answer:
      "Ja, je kunt in Voetbaldraft 34-0-0 halen. Dat moet alleen zeldzaam en moeilijk blijven, want je hebt sterke historische spelers, balans tussen aanval en verdediging en ook een beetje geluk nodig om een perfect seizoen te simuleren.",
  },
  {
    question: "Welke clubs zitten erin?",
    answer:
      "De database bevat historische Eredivisie-teams van meerdere clubs en groeit verder door. Je kunt onder meer spelers draften uit teams van Ajax, PSV, Feyenoord, AZ, FC Twente, NEC, FC Groningen en meer, verspreid over klassieke seizoenen en modernere selecties.",
  },
  {
    question: "Is Voetbaldraft officieel verbonden aan de Eredivisie?",
    answer:
      "Nee, Voetbaldraft is geen officieel Eredivisie-spel. Voetbaldraft.app is een onafhankelijk fanproject en is niet gelieerd aan, goedgekeurd door of verbonden met voetbalclubs, spelers, de KNVB of Eredivisie CV.",
  },
] as const;

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
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
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
