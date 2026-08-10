import rss from "@astrojs/rss";
import type { APIContext } from "astro";

import siteData from "../content/metadata.json";
import { blocksToRssHtml } from "../lib/rss/blocksToRssHtml";
import {
  getArticleUrl,
  getFeedArticles,
  getFeedSite,
  getLatestFeedDate,
  getStrapiPublicUrl,
} from "../lib/rss/feed";

export async function GET(context: APIContext) {
  const site = getFeedSite(context);
  const strapiPublicUrl = getStrapiPublicUrl();
  const authorName = siteData.author || "Unknown";
  const channelImage = new URL("/icons/icon-512x512.png", site).toString();
  const articles = await getFeedArticles();
  const latestFeedDate = getLatestFeedDate(articles);

  const items = articles.map((article) => {
    const link = getArticleUrl(article, site);
    const contentHtml = blocksToRssHtml(article.data.content, {
      site,
      strapiPublicUrl,
    });

    return {
      title: article.data.title ?? "Untitled",
      pubDate: new Date(article.data.createdAt),
      description: article.data.description ?? "",
      link,
      content: contentHtml || undefined,
      customData: `<dc:creator><![CDATA[${authorName}]]></dc:creator>`,
    };
  });

  const response = await rss({
    title: siteData.feedTitle || "Articles",
    description: siteData.description || "Latest articles",
    site: site.toString(),
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
      dc: "http://purl.org/dc/elements/1.1/",
      sy: "http://purl.org/rss/1.0/modules/syndication/",
    },
    items,
    customData: [
      `<atom:link href="${new URL("/feed.xml", site).toString()}" rel="self" type="application/rss+xml" />`,
      `<language>${siteData.language || "en-US"}</language>`,
      latestFeedDate
        ? `<lastBuildDate>${latestFeedDate.toUTCString()}</lastBuildDate>`
        : "",
      `<sy:updatePeriod>daily</sy:updatePeriod>`,
      `<sy:updateFrequency>1</sy:updateFrequency>`,
      `<generator>${siteData.generator || "Astro"}</generator>`,
      `<image><url>${channelImage}</url><title>${siteData.title}</title><link>${site.toString()}</link></image>`,
    ]
      .filter(Boolean)
      .join(""),
  });

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "application/rss+xml; charset=utf-8");
  return new Response(response.body, { headers });
}
