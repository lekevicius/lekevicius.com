import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

import { blocksToRssHtml } from '../lib/rss/blocksToRssHtml'
import type { ArticleEntry } from '../lib/strapiTypes'
import siteData from '../content/metadata.json'

const SITE_FALLBACK = 'https://lekevicius.com'

const getSiteUrl = (context: APIContext) => {
  return context.site ?? new URL(SITE_FALLBACK)
}

export async function GET(context: APIContext) {
  const site = getSiteUrl(context)
  const strapiPublicUrl = import.meta.env.OG_IMAGE_BASE_URL
  const authorName = siteData.author || 'Unknown'
  const channelImage = `${siteData.siteUrl}/icons/icon-512x512.png`

  const articles = (await getCollection('articles')) as ArticleEntry[]

  const items = articles
    .filter((article) => Boolean(article.data.slug))
    .sort((a, b) => new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime())
    .map((article) => {
      const year = new Date(article.data.createdAt).getFullYear().toString()
      const link = new URL(`/${year}/${article.data.slug}`, site).toString()
      const contentHtml = blocksToRssHtml(article.data.content, { site, strapiPublicUrl })
      const guid = link

      return {
        title: article.data.title ?? 'Untitled',
        pubDate: new Date(article.data.createdAt),
        description: article.data.description ?? '',
        link,
        customData: [
          `<dc:creator><![CDATA[${authorName}]]></dc:creator>`,
          `<guid>${guid}</guid>`,
          contentHtml ? `<content:encoded><![CDATA[${contentHtml}]]></content:encoded>` : '',
        ]
          .filter(Boolean)
          .join(''),
      }
    })

  return rss({
    title: siteData.feedTitle || 'Articles',
    description: 'Latest articles',
    site: site.toString(),
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      atom: 'http://www.w3.org/2005/Atom',
      dc: 'http://purl.org/dc/elements/1.1/',
      sy: 'http://purl.org/rss/1.0/modules/syndication/',
    },
    items,
    customData: [
      `<atom:link href="${new URL('/feed.xml', site).toString()}" rel="self" type="application/rss+xml" />`,
      `<language>${siteData.language || 'en-US'}</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<sy:updatePeriod>daily</sy:updatePeriod>`,
      `<sy:updateFrequency>1</sy:updateFrequency>`,
      `<generator>${siteData.generator || 'Astro'}</generator>`,
      `<image><url>${channelImage}</url><title>${siteData.title}</title><link>${site.toString()}</link></image>`,
    ].join(''),
  })
}
