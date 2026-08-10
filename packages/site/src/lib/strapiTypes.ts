import type { ImageMetadata } from "astro";

// ============================================================================
// Base Types & Common Fields
// ============================================================================

export type StrapiMediaSource = string | ImageMetadata;

export const getStrapiMediaUrl = (
  source: StrapiMediaSource | null | undefined,
) => {
  const value = typeof source === "string" ? source : source?.src;
  if (!value || /^(?:https?:)?\/\//i.test(value) || !value.startsWith("/")) {
    return value;
  }

  const assetBaseUrl =
    import.meta.env.PUBLIC_STRAPI_ASSET_BASE_URL || import.meta.env.STRAPI_URL;
  if (!assetBaseUrl) return value;

  try {
    return new URL(value, assetBaseUrl).toString();
  } catch {
    return value;
  }
};

/** Common fields present on all Strapi collection entries */
export interface StrapiBaseFields {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

/** Strapi media object for images, videos, and files */
export interface StrapiMedia {
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  } | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: StrapiMediaSource;
  previewUrl?: string | null;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface StrapiMediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: StrapiMediaSource;
}

// ============================================================================
// Content Components (Dynamic Zones)
// ============================================================================

export type StrapiContentComponentType =
  "shared.rich-text" | "shared.media" | "shared.slide";

export interface StrapiContentBaseComponent {
  id: number;
  __component: StrapiContentComponentType;
}

export interface StrapiRichTextComponent extends StrapiContentBaseComponent {
  __component: "shared.rich-text";
  body: string;
}

export interface StrapiMediaComponent extends StrapiContentBaseComponent {
  __component: "shared.media";
  file: StrapiMedia;
  display?: "plain" | "full" | "boxed" | "website" | null;
  caption?: string | null;
  link?: string | null;
}

export interface StrapiSlideComponent extends StrapiContentBaseComponent {
  __component: "shared.slide";
  image?: StrapiMedia | null;
  text?: string | null;
}

export type StrapiContentComponent =
  StrapiRichTextComponent | StrapiMediaComponent | StrapiSlideComponent;
export type StrapiContentComponents = StrapiContentComponent[];

// ============================================================================
// Collection Data Types (what .data contains)
// ============================================================================

/** Page collection data */
export interface PageData extends StrapiBaseFields {
  title: string | null;
  slug: string | null;
  description?: string | null;
  cover?: StrapiMedia | null;
  content?: StrapiContentComponents | null;
}

/** Project collection data */
export interface ProjectData extends StrapiBaseFields {
  title: string | null;
  slug: string | null;
  description?: string | null;
  cover?: StrapiMedia | null;
  image?: StrapiMedia | null;
  tag?: string | null;
  note?: string | null;
  releasedAt?: string | null;
  active?: boolean | null;
  content?: StrapiContentComponents | null;
}

/** Article collection data */
export interface ArticleData extends StrapiBaseFields {
  title: string | null;
  slug: string | null;
  description?: string | null;
  cover?: StrapiMedia | null;
  content?: StrapiContentComponents | null;
}

// ============================================================================

/** Talk collection data */
export interface TalkData extends StrapiBaseFields {
  title: string | null;
  slug: string | null;
  recordingLink?: string | null;
  presentedAt?: string | null;
  description?: string | null;
  cover?: StrapiMedia | null;
  image?: StrapiMedia | null;
  tag?: string | null;
  note?: string | null;
  content?: StrapiContentComponents | null;
}

/** Video collection data */
export interface VideoData extends StrapiBaseFields {
  title: string | null;
  slug: string | null;
  link: string | null;
  releasedAt: string | null;
  description?: string | null;
  cover?: StrapiMedia | null;
  image?: StrapiMedia | null;
  tag?: string | null;
  note?: string | null;
  content?: StrapiContentComponents | null;
}

// ============================================================================

/** Appearance collection data */
export interface AppearanceData extends StrapiBaseFields {
  date: string | null;
  link?: string | null;
  publisher?: string | null;
  title: string | null;
  description?: string | null;
  language?: "Lithuanian" | "English" | null;
  type?: string | null;
}

/** Moment collection data */
export interface MomentData extends StrapiBaseFields {
  text: string | null;
  location?: string | null;
}

// ============================================================================
// Collection Entry Types
// These wrap the data types in the Astro collection entry structure
// ============================================================================

export interface StrapiCollectionEntry<T> {
  id: string;
  body?: string;
  collection: string;
  data: T;
  rendered?: {
    html: string;
    metadata?: {
      imagePaths: string[];
      [key: string]: unknown;
    };
  };
  filePath?: string;
}

export type PageEntry = StrapiCollectionEntry<PageData> & {
  collection: "pages";
};
export type ProjectEntry = StrapiCollectionEntry<ProjectData> & {
  collection: "projects";
};
export type ArticleEntry = StrapiCollectionEntry<ArticleData> & {
  collection: "articles";
};
export type MomentEntry = StrapiCollectionEntry<MomentData> & {
  collection: "moments";
};
export type AppearanceEntry = StrapiCollectionEntry<AppearanceData> & {
  collection: "appearances";
};
export type TalkEntry = StrapiCollectionEntry<TalkData> & {
  collection: "talks";
};
export type VideoEntry = StrapiCollectionEntry<VideoData> & {
  collection: "videos";
};

// ============================================================================
// Type-safe getCollection results
// Usage: const pages = await getCollection('pages') as PageEntry[]
// ============================================================================

export type CollectionDataMap = {
  pages: PageData;
  projects: ProjectData;
  articles: ArticleData;
  moments: MomentData;
  appearances: AppearanceData;
  talks: TalkData;
  videos: VideoData;
};

export type CollectionEntryMap = {
  pages: PageEntry;
  projects: ProjectEntry;
  articles: ArticleEntry;
  moments: MomentEntry;
  appearances: AppearanceEntry;
  talks: TalkEntry;
  videos: VideoEntry;
};

// ============================================================================
// Helper type for extracting data from CollectionEntry
// ============================================================================

/**
 * Type helper to extract the properly typed data from a collection entry
 * @example
 * const pages = await getCollection('pages')
 * const page = pages[0]
 * const data = page.data as StrapiData<'pages'> // PageData
 */
export type StrapiData<C extends keyof CollectionDataMap> =
  CollectionDataMap[C];

/**
 * Type helper for properly typed collection entries
 * @example
 * const pages = await getCollection('pages') as StrapiEntry<'pages'>[]
 */
export type StrapiEntry<C extends keyof CollectionEntryMap> =
  CollectionEntryMap[C];

// ============================================================================
// Type Guards
// ============================================================================

export function isRichTextComponent(
  component: StrapiContentComponent,
): component is StrapiRichTextComponent {
  return component.__component === "shared.rich-text";
}

export function isMediaComponent(
  component: StrapiContentComponent,
): component is StrapiMediaComponent {
  return component.__component === "shared.media";
}

export function isSlideComponent(
  component: StrapiContentComponent,
): component is StrapiSlideComponent {
  return component.__component === "shared.slide";
}

// ============================================================================
// Note on Type Usage
// ============================================================================
//
// The @sensinum/astro-strapi-loader generates dynamic Zod schemas at build time.
// Astro's type inference (InferEntrySchema) works but returns generic types.
//
// To get proper typing, use type assertions or the helper types below:
//
// Option 1: Type assertion on getCollection result
//   const pages = await getCollection('pages') as PageEntry[]
//
// Option 2: Type assertion on individual entry data
//   const pageData = page.data as PageData
//
// Option 3: Use the typed getter helpers (if you add them)
//   const pages = await getTypedCollection('pages')
// ============================================================================
