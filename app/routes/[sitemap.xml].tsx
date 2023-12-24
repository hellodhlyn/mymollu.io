import type { LoaderFunction } from "@remix-run/cloudflare";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { Env } from "~/env.server";
import { getAllEvents } from "~/models/event";

type SitemapItem = {
  link: string;
  lastmod: Dayjs;
  changefreq: string;
  priority: number;
};

const HOST = "https://mollulog.net";

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.env as Env;

  const events = (await getAllEvents(env)).filter((event) => event.hasDetail).reverse();
  const now = dayjs();
  const items: SitemapItem[] = events.map((event) => {
    const until = dayjs(event.until);
    const isOutdated = dayjs(event.until).isBefore(now);
    return {
      link: `${HOST}/events/${event.id}`,
      lastmod: isOutdated ? until : now,
      changefreq: isOutdated ? "yearly" : "daily",
      priority: isOutdated ? 0.3 : 1.0,
    };
  });

  items.push(
    { link: `${HOST}/events`, lastmod: dayjs(), changefreq: "daily", priority: 1.0 },
  );

  const xmlUrls = items.map((item) => {
    return `
<url>
  <loc>${item.link}</loc>
  <lastmod>${item.lastmod.format("YYYY-MM-DD")}</lastmod>
  <priority>${item.priority.toFixed(1)}</priority>
</url>`.trim();
  }).join("\n");

  const xmlPrefix = "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
  const xmlPostfix = "</urlset>";
  const sitemap = [xmlPrefix, xmlUrls, xmlPostfix].join("\n");

  return new Response(sitemap, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "xml-version": "1.0",
      "encoding": "utf-8",
    },
  });
};
