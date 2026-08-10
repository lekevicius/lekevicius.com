import type { APIContext } from "astro";

import siteData from "../content/metadata.json";
import { blocksToRssHtml } from "../lib/rss/blocksToRssHtml";
import {
  getAbsoluteMediaUrl,
  getArticleUrl,
  getFeedArticles,
  getFeedSite,
  getStrapiPublicUrl,
  htmlToText,
} from "../lib/rss/feed";

export async function GET(context: APIContext) {
  const site = getFeedSite(context);
  const strapiPublicUrl = getStrapiPublicUrl();
  const authorName = siteData.author || "Unknown";
  const authorUrl = siteData.authorUrl || site.toString();
  const authorAvatar = siteData.authorAvatar || undefined;
  const icon = new URL("/icons/icon-512x512.png", site).toString();
  const articles = await getFeedArticles();

  const items = articles.map((article) => {
    const url = getArticleUrl(article, site);
    const contentHtml = blocksToRssHtml(article.data.content, {
      site,
      strapiPublicUrl,
    });
    const contentText = contentHtml
      ? htmlToText(contentHtml)
      : article.data.description || article.data.title || "Untitled";

    return {
      id: url,
      url,
      title: article.data.title ?? "Untitled",
      summary: article.data.description ?? undefined,
      content_html: contentHtml || undefined,
      content_text: contentText,
      image: getAbsoluteMediaUrl(article.data.cover, site, strapiPublicUrl),
      date_published: new Date(article.data.createdAt).toISOString(),
      date_modified: new Date(article.data.updatedAt).toISOString(),
      authors: [
        {
          name: authorName,
          url: authorUrl,
          avatar: authorAvatar,
        },
      ],
      // Kept for JSON Feed 1.0 readers; 1.1 readers use `authors`.
      author: {
        name: authorName,
        url: authorUrl,
        avatar: authorAvatar,
      },
    };
  });

  const feedUrl = new URL("/feed.json", site).toString();
  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: siteData.feedTitle ?? "Articles",
    description: siteData.description ?? undefined,
    home_page_url: site.toString(),
    feed_url: feedUrl,
    language: siteData.language || "en-US",
    user_comment: `This feed is in JSON Feed format. Add this URL to your reader: ${feedUrl}`,
    icon,
    favicon: new URL("/favicon.svg", site).toString(),
    authors: [
      {
        name: authorName,
        url: authorUrl,
        avatar: authorAvatar,
      },
    ],
    items,
  };

  return new Response(JSON.stringify(feed), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
    },
  });
}
