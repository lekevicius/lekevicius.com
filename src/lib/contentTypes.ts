export type Episode = {
  id: number
  number: number | null // from Strapi field "number"
  title: string
  description: string
  links: string
  sponsor: string
  extraContent: string
  publishedOn: string | null // ISO
  videoUrl: string
  audioUrl: string
  audioSize: number | null
  audioDuration: string
}
