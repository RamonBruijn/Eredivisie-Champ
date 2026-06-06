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
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
