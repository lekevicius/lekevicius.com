import { getCollection } from "astro:content";
import type { CollectionEntryMap } from "./strapiTypes";

export type ContentCollectionName = keyof CollectionEntryMap;

export const isDevContentEnabled = import.meta.env.DEV;

export const isDevEntry = (entry: { id: string }) =>
  entry.id.startsWith("dev-");

export async function getContentCollection<C extends ContentCollectionName>(
  collection: C,
): Promise<CollectionEntryMap[C][]> {
  const strapiEntries = (await getCollection(
    collection as never,
  )) as unknown as CollectionEntryMap[C][];

  if (!isDevContentEnabled) return strapiEntries;

  const { devContent } = await import("../content/devContent");
  return [
    ...(devContent[collection] as CollectionEntryMap[C][]),
    ...strapiEntries,
  ];
}
