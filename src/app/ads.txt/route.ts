import { SITE_URL } from "@/lib/site";

export function GET() {
  const hostname = new URL(SITE_URL).hostname;
  const body = [
    "# ads.txt for Eredivisie Champ",
    `# Host: ${hostname}`,
    "# No advertising seller accounts configured yet.",
    "# Update this file before enabling ad monetization.",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
