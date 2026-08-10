import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL("https://lekevicius.com");
  const robots = import.meta.env.PUBLIC_ROBOTS || "index, follow";
  const disallowAll = robots.toLowerCase().includes("noindex");
  const body = [
    "User-agent: *",
    disallowAll ? "Disallow: /" : "Allow: /",
    "",
    `Sitemap: ${new URL("/sitemap-index.xml", siteUrl)}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
