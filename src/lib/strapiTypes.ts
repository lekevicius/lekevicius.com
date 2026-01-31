export type StrapiMedia = {
  url: string
  alternativeText: string
  caption: string
  width: number
  height: number
  hash: string
  ext: string
  mime: string
  size: number
  previewUrl: string
  provider: string
  provider_metadata: any
  formats: {
    small?: StrapiMedia
    medium?: StrapiMedia
    large?: StrapiMedia
  }
}

// Content Components for Strapi Blocks
export type StrapiContentComponentTypes = 'shared.rich-text' | 'shared.media' | 'shared.quote'

export type StrapiContentBaseComponent = {
  id: number
  __component: StrapiContentComponentTypes
}

export type StrapiContentRichTextComponent = StrapiContentBaseComponent & {
  __component: 'shared.rich-text'
  body: string
}

export type StrapiContentMediaComponent = StrapiContentBaseComponent & {
  __component: 'shared.media'
  file: StrapiMedia
}

export type StrapiContentQuoteComponent = StrapiContentBaseComponent & {
  __component: 'shared.quote'
  title: string
  body?: string
}

export type StrapiContentComponent = StrapiContentRichTextComponent | StrapiContentQuoteComponent | StrapiContentMediaComponent

export type StrapiContentComponents = Array<StrapiContentComponent>

// Page Types
export type StrapiPage = {
  id: number
  documentId: string
  title: string
  slug: string
  content?: StrapiContentComponents
  publishedAt: string
  updatedAt: string
}

export type StrapiGlobal = {
  id: number
  documentId: string
  siteName: string
  logo?: StrapiMedia
  navigation?: any
  footer?: any
  publishedAt: string
  updatedAt: string
}
