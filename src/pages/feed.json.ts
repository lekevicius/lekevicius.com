import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

import { blocksToRssHtml } from '../lib/rss/blocksToRssHtml'
import type { ArticleEntry } from '../lib/strapiTypes'
import siteData from '../content/metadata.json'

const SITE_FALLBACK = 'https://lekevicius.com'

const getSiteUrl = (context: APIContext) => {
  return context.site ?? new URL(SITE_FALLBACK)
}

const stripHtml = (html: string) => {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(context: APIContext) {
  const site = getSiteUrl(context)
  const strapiPublicUrl = import.meta.env.STRAPI_URL
  const authorName = siteData.author || 'Unknown'
  const authorUrl = siteData.authorUrl || site.toString()
  const authorAvatar = siteData.authorAvatar || undefined
  const icon = `${siteData.siteUrl}/icons/icon-512x512.png`

  const articles = (await getCollection('articles')) as ArticleEntry[]

  const items = articles
    .filter((article) => Boolean(article.data.slug))
    .sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
    .map((article) => {
      const year = new Date(article.data.createdAt).getFullYear().toString()
      const url = new URL(`/${year}/${article.data.slug}`, site).toString()
      const contentHtml = blocksToRssHtml(article.data.content, { site, strapiPublicUrl })
      const contentText = contentHtml ? stripHtml(contentHtml) : undefined

      return {
        id: article.id,
        url,
        title: article.data.title ?? 'Untitled',
        summary: article.data.description ?? undefined,
        content_html: contentHtml || undefined,
        content_text: contentText,
        date_published: new Date(article.data.createdAt).toISOString(),
        date_modified: new Date(article.data.updatedAt).toISOString(),
        authors: [
          {
            name: authorName,
            url: authorUrl,
            avatar: authorAvatar,
          },
        ],
        author: {
          name: authorName,
          url: authorUrl,
          avatar: authorAvatar,
        },
      }
    })

  const feedUrl = new URL('/feed.json', site).toString()
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: siteData.title ?? 'Articles',
    description: siteData.description ?? undefined,
    home_page_url: site.toString(),
    feed_url: feedUrl,
    language: 'en-US',
    user_comment: `This feed is in JSON Feed format. Add this URL to your reader: ${feedUrl}`,
    icon,
    favicon: `${siteData.siteUrl}/favicon.svg`,
    authors: [
      {
        name: authorName,
        url: authorUrl,
        avatar: authorAvatar,
      },
    ],
    items,
  }

  return new Response(JSON.stringify(feed), {
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
    },
  })
}
