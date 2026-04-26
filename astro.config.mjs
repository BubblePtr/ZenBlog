import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import path from 'path';
import { stripLeadingHeadingOne } from './src/remark/strip-leading-heading-one.mjs';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://ninthbit.org',
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
    domains: ['gravatar.com', 'cdn.ninthbit.org'],
  },
  integrations: [
    mdx({
      remarkPlugins: [stripLeadingHeadingOne, remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    sitemap(),
    react()
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@resvg/resvg-wasm'],
    },
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
