import { getCollection, type CollectionEntry } from 'astro:content';
import type { Language } from '@/i18n/config';
import type { PhotographyPhotoItem } from '@/types/content';

export type PhotographyEntry = CollectionEntry<'photography'>;

export interface PhotographyDateGroup {
  dateKey: string;
  photos: PhotographyPhotoItem[];
}

function formatDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function comparePhotographyEntries(a: PhotographyEntry, b: PhotographyEntry): number {
  const dateA = formatDateKey(a.data.shotDate);
  const dateB = formatDateKey(b.data.shotDate);

  if (dateA !== dateB) {
    return dateA < dateB ? 1 : -1;
  }

  const orderA = a.data.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.data.order ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.id.localeCompare(b.id);
}

export function mapPhotographyPhotoItem(
  entry: PhotographyEntry,
  lang: Language,
): PhotographyPhotoItem {
  const imageSrc = typeof entry.data.image === 'string' ? entry.data.image : entry.data.image.src;
  const imageWidth =
    typeof entry.data.image === 'string' ? entry.data.imageWidth : entry.data.image.width;
  const imageHeight =
    typeof entry.data.image === 'string' ? entry.data.imageHeight : entry.data.image.height;

  return {
    slug: entry.id,
    data: {
      title: entry.data.title[lang],
      location: entry.data.location?.[lang],
      shotDate: entry.data.shotDate,
      imageSrc,
      imageWidth,
      imageHeight,
      exif: entry.data.exif,
    },
  };
}

export async function getPhotographyDateGroups(lang: Language): Promise<PhotographyDateGroup[]> {
  const entries = (await getCollection('photography')).sort(comparePhotographyEntries);
  const groups = new Map<string, PhotographyPhotoItem[]>();

  for (const entry of entries) {
    const dateKey = formatDateKey(entry.data.shotDate);
    const photo = mapPhotographyPhotoItem(entry, lang);
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(photo);
    } else {
      groups.set(dateKey, [photo]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, photos]) => ({ dateKey, photos }));
}

export async function getPhotographyForHome(
  lang: Language,
  limit = 6,
): Promise<PhotographyPhotoItem[]> {
  const entries = (await getCollection('photography')).sort(comparePhotographyEntries);
  return entries.slice(0, limit).map((entry) => mapPhotographyPhotoItem(entry, lang));
}
