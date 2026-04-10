import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      heroImage: z.union([image(), z.literal('')]).optional(),
      author: z
        .object({
          name: z.string(),
          title: z.string().optional(),
          avatar: z.string().optional(),
        })
        .optional(),
      source: z.enum(['human', 'openclaw']).default('human'),
      series: z.string().optional(),
      externalId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      showOnHome: z.boolean().optional(),
      lang: z.enum(['en', 'zh']).default('zh'), // 语言标识，默认中文
    }),
});

const projects = defineCollection({
  type: 'content',
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
  type: 'content',
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
