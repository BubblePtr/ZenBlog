import type { ImageMetadata } from 'astro';

export interface BlogAuthor {
  name: string;
  title?: string;
  avatar?: string;
}

export interface BlogListItem {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    heroImage?: ImageMetadata | '';
    author?: BlogAuthor;
    showOnHome?: boolean;
  };
}

export interface BubbleDiarySummary {
  totalEntries: number;
  latestEntry: {
    title: string;
    description: string;
    pubDate: Date;
    lang: 'en' | 'zh';
    url: string;
  };
}

export interface ProjectListItem {
  slug: string;
  data: {
    title: string;
    description: string;
    heroImage?: string;
    stack: string[];
    github?: string;
    demo?: string;
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
    imageSrc: string;
    imageWidth?: number;
    imageHeight?: number;
    exif?: PhotoExif;
  };
}
