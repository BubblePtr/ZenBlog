import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      heroImage: z.union([image(), z.literal('')]).optional(),
      heroImageCredit: z
        .object({
          author: z.string(),
          authorUrl: z.string().url(),
          source: z.string(),
          sourceUrl: z.string().url(),
        })
        .optional(),
      author: z
        .object({
          name: z.string(),
          title: z.string().optional(),
          avatar: z.string().optional(),
        })
        .optional(),
      tags: z.array(z.string()).optional(),
      showOnHome: z.boolean().optional(),
      lang: z.enum(['en', 'zh']).default('zh'), // 语言标识，默认中文
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      order: z.number(),
      heroImage: image().optional(),
      stack: z.array(z.string()),
      github: z.string().optional(),
      demo: z.string().optional(),
    }),
});

const photography = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/photography' }),
  schema: ({ image }) =>
    z.object({
      title: z.object({
        en: z.string(),
        zh: z.string(),
      }),
      location: z
        .object({
          en: z.string(),
          zh: z.string(),
        })
        .optional(),
      shotDate: z.coerce.date(),
      image: z.union([image(), z.string().url()]),
      imageWidth: z.number().int().positive().optional(),
      imageHeight: z.number().int().positive().optional(),
      order: z.number().optional(),
      exif: z
        .object({
          brand: z.string().optional(),
          model: z.string().optional(),
          lens: z.string().optional(),
          focalLength: z.string().optional(),
          aperture: z.string().optional(),
          shutterSpeed: z.string().optional(),
          iso: z.number().int().positive().optional(),
        })
        .optional(),
    }),
});

export const collections = {
  blog,
  projects,
  photography,
};
