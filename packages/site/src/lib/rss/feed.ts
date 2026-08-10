import type { APIContext } from "astro";
import siteData from "../../content/metadata.json";
import { getContentCollection } from "../content";
import {
  getStrapiMediaUrl,
  type ArticleEntry,
  type StrapiMedia,
} from "../strapiTypes";

const SITE_FALLBACK = "https://lekevicius.com";
export const FEED_ITEM_LIMIT = 30;

export const getFeedSite = (context: APIContext) => {
  if (import.meta.env.DEV) return new URL(context.url.origin);
  return context.site ?? new URL(siteData.siteUrl || SITE_FALLBACK);
};

export const getFeedArticles = async () =>
  ((await getContentCollection("articles")) as ArticleEntry[])
    .filter(
      (article) =>
        Boolean(article.data.slug) &&
        !Number.isNaN(new Date(article.data.createdAt).getTime()),
    )
    .sort(
      (a, b) =>
        new Date(b.data.createdAt).getTime() -
        new Date(a.data.createdAt).getTime(),
    )
    .slice(0, FEED_ITEM_LIMIT);

export const getArticleUrl = (article: ArticleEntry, site: URL) => {
  const year = new Date(article.data.createdAt).getFullYear().toString();
  return new URL(`/${year}/${article.data.slug}`, site).toString();
};

export const getStrapiPublicUrl = () =>
  import.meta.env.PUBLIC_STRAPI_ASSET_BASE_URL ||
  import.meta.env.OG_IMAGE_BASE_URL ||
  import.meta.env.STRAPI_URL ||
  undefined;

export const getAbsoluteMediaUrl = (
  media: StrapiMedia | null | undefined,
  site: URL,
  strapiPublicUrl = getStrapiPublicUrl(),
) => {
  const value = getStrapiMediaUrl(media?.url);
  if (!value) return undefined;

  try {
    if (value.startsWith("/uploads") && strapiPublicUrl) {
      return new URL(value, strapiPublicUrl).toString();
    }
    return new URL(value, site).toString();
  } catch {
    return undefined;
  }
};

export const getLatestFeedDate = (articles: ArticleEntry[]) => {
  const dates = articles
    .flatMap((article) => [article.data.updatedAt, article.data.createdAt])
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);

  if (dates.length === 0) return undefined;
  return new Date(Math.max(...dates));
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_match, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&#x([\da-f]+);/gi, (_match, code) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

export const htmlToText = (html: string) =>
  decodeHtmlEntities(
    html
      .replace(/<\/(p|h[1-6]|li|blockquote|pre|figure|figcaption|tr)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
