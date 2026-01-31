const STRAPI_URL = import.meta.env.STRAPI_URL.replace(/\/+$/, '')
const TOKEN = import.meta.env.STRAPI_TOKEN

import type { Episode } from './contentTypes'

interface Props {
  endpoint: string
  query?: Record<string, string | number | boolean>
  wrappedByKey?: string
  wrappedByList?: boolean
}

type StrapiResp<T> = { data: Array<T>; meta: any }
const headers = { Authorization: `Bearer ${TOKEN}` }

/**
 * Fetches data from the Strapi API
 * @param endpoint - The endpoint to fetch from
 * @param query - The query parameters to add to the url
 * @param wrappedByKey - The key to unwrap the response from
 * @param wrappedByList - If the response is a list, unwrap it
 * @returns
 */
export default async function fetchApi<T>({ endpoint, query, wrappedByKey, wrappedByList }: Props): Promise<T> {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1)
  }
  const url = new URL(`${STRAPI_URL}/api/${endpoint}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  const res = await fetch(url.toString(), { headers })
  let data = await res.json()

  if (wrappedByKey) {
    data = data[wrappedByKey]
  }

  if (wrappedByList) {
    data = data[0]
  }

  return data as T
}

export async function getEpisodesPage(page = 1, pageSize = 20) {
  const url = new URL(`${STRAPI_URL}/api/episodes`)
  url.searchParams.set('pagination[page]', String(page))
  url.searchParams.set('pagination[pageSize]', String(pageSize))
  url.searchParams.set('sort', 'number:desc')
  // Only needed fields
  url.searchParams.set('fields', ['number', 'title', 'description', 'links', 'sponsor', 'extraContent', 'publishedOn', 'videoUrl', 'audioUrl', 'audioSize', 'audioDuration'].join(','))

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(await res.text())
  const json = (await res.json()) as StrapiResp<Episode>
  const items = json.data.map(wrapEpisode)
  const { pageCount, total, page: cur } = json.meta?.pagination || {}
  return { items, page: cur ?? page, pageCount: pageCount ?? 1, total: total ?? items.length }
}

export async function getAllEpisodes(batch = 100): Promise<Episode[]> {
  const out: Episode[] = []
  let page = 1
  while (true) {
    const { items, pageCount } = await getEpisodesPage(page, batch)
    out.push(...items)
    if (page >= pageCount) break
    page++
  }
  return out
}

export async function getEpisodeByNumber(num: number) {
  const url = new URL(`${STRAPI_URL}/api/episodes`)
  url.searchParams.set('filters[number][$eq]', String(num))
  url.searchParams.set('pagination[pageSize]', '1')
  url.searchParams.set('fields', ['number', 'title', 'description', 'links', 'sponsor', 'extraContent', 'publishedOn', 'videoUrl', 'audioUrl', 'audioSize', 'audioDuration'].join(','))
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(await res.text())
  const json = (await res.json()) as StrapiResp<Episode>
  return json.data[0] ? wrapEpisode(json.data[0]) : null
}

function wrapEpisode(e: Episode): Episode {
  return {
    id: e.id,
    number: safeInt(e.number),
    title: e.title || '',
    description: e.description || '',
    links: e.links || '',
    sponsor: e.sponsor || '',
    extraContent: e.extraContent || '',
    publishedOn: e.publishedOn || null,
    videoUrl: e.videoUrl || '',
    audioUrl: e.audioUrl || '',
    audioSize: typeof e.audioSize === 'number' ? e.audioSize : safeInt(e.audioSize),
    audioDuration: e.audioDuration || '',
  }
}
function safeInt(v: any): number | null {
  const n = Number.parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) ? n : null
}
