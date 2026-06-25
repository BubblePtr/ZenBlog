import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';
import { stripLeadingHeadingOne } from './src/remark/strip-leading-heading-one.mjs';
import { anchorHeadings } from './src/rehype/anchor-headings.mjs';
import remarkMath from 'remark-math';
import remarkCjkFriendly from 'remark-cjk-friendly/parseOnly';
import rehypeKatex from 'rehype-katex';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headingAnchorOptions = {
  ariaLabelPrefix: 'Link to',
  include: ['/src/content/blog/'],
};

// https://astro.build/config
export default defineConfig({
  site: 'https://kieran.build',
  // 纯静态输出，可直接部署到 Cloudflare Pages
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  image: {
    domains: ['gravatar.com', 'cdn.ninthbit.org', 'opengraph.githubassets.com'],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [stripLeadingHeadingOne, remarkCjkFriendly, remarkMath],
      rehypePlugins: [rehypeKatex, [anchorHeadings, headingAnchorOptions]],
    }),
  },
  integrations: [
    mdx(),
    sitemap(),
    react()
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      watch: {
        // 忽略 content 目录的变化，防止 CMS 保存时触发 HMR 刷新
        ignored: ['**/src/content/**']
      }
    }
  }
});
