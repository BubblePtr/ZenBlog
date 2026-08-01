import type { ImageMetadata } from 'astro';

export interface BlogAuthor {
  name: string;
  title?: string;
  avatar?: string;
}

export interface BlogListItem {
  slug: string;
  /* Unified (cross-language) list fields: the row's target URL — which may
     point into the other language tree — and every language the post
     exists in. Absent on single-language lists. */
  url?: string;
  languages?: ('en' | 'zh')[];
  data: {
    title: string;
    description: string;
    pubDate: Date;
    heroImage?: ImageMetadata | '';
    author?: BlogAuthor;
    authorName: string;
    tags?: string[];
    showOnHome?: boolean;
  };
}

export interface ProjectListItem {
  slug: string;
  data: {
    title: string;
    description: string;
    content: string;
    heroImage?: string;
    stack: string[];
    github?: string;
    demo?: string;
    status?: 'building' | 'shipped';
  };
}

export interface PhotoExif {
  brand?: string;
  model?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
}

export interface PhotographyPhotoItem {
  slug: string;
  data: {
    title: string;
    location?: string;
    shotDate: Date;
    /** Display src (WebP variant when available). */
    imageSrc: string;
    /** Responsive srcset for display variants; omit when unavailable. */
    imageSrcSet?: string;
    /** Full-resolution original CDN URL. */
    imageOriginalSrc?: string;
    imageWidth?: number;
    imageHeight?: number;
    exif?: PhotoExif;
  };
}
