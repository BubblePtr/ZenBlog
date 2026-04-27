/**
 * ZenBlog — Dynamic per-post OG image
 * Route: /og/[...slug].png
 *
 * Reads the post from the 'blog' content collection.
 * Detects language from the slug prefix (zh/ → Chinese, else English).
 *
 * Deps: satori  @resvg/resvg-wasm
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'fs';
import path from 'path';
import { createRequire } from 'node:module';
import { loadAndInvertPng } from '@/shared/og/invert-png';

// ─── WASM init ───────────────────────────────────────────────────────────────
const wasmPath = createRequire(import.meta.url).resolve('@resvg/resvg-wasm/index_bg.wasm');

let wasmReady: Promise<void> | false = false;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      try {
        await initWasm(readFileSync(wasmPath));
      } catch (e) {
        // initWasm is globally singular — another chunk may have already initialized it
        if (!(e instanceof Error) || !e.message.includes('Already initialized')) throw e;
      }
    })();
  }
  return wasmReady;
}

// ─── Local fonts ──────────────────────────────────────────────────────────────
const FONT_DIR = path.join(process.cwd(), 'src', 'fonts');

function loadFont(filename: string): ArrayBuffer {
  const buf = readFileSync(path.join(FONT_DIR, filename));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ─── Illustration pool (same as homepage writing section) ────────────────────
const ILLUSTRATIONS = [
  'absurd-01.png',
  'absurd-02.png',
  'absurd-03.png',
  'absurd-04.png',
  'absurd-05.png',
  'absurd-06.png',
  'absurd-07.png',
  'absurd-08.png',
  'absurd-09.png',
  'absurd-10.png',
  'absurd-11.png',
  'absurd-31.png',
  'absurd-32.png',
  'absurd-33.png',
  'absurd-34.png',
];
const ILLUSTRATION_DIR = path.join(process.cwd(), 'public', 'images', 'illustrations');

function pickIllustration(slug: string): string {
  const hash = slug.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ILLUSTRATIONS[hash % ILLUSTRATIONS.length];
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const BG = '#09090b';
const BG_PANEL = '#0e0e10';
const FG = 'rgba(255,255,255,0.87)';
const FG2 = '#a1a1aa';
const FG3 = 'rgba(255,255,255,0.38)';
const PURPLE = '#6229FF';
const PURPLE_MID = '#9D8AFF';
const RAIL = 'rgba(255,255,255,0.14)';
const BORDER = 'rgba(238,238,246,0.11)';

// ─── Locale helpers ──────────────────────────────────────────────────────────
function isZH(slug: string) {
  return slug.startsWith('zh/') || slug.startsWith('zh-');
}

function formatDate(date: Date, zh: boolean): string {
  if (zh) {
    return date
      .toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
      .replace(/\//g, '.');
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

// ─── Static paths ─────────────────────────────────────────────────────────────
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => {
    // post.id is the file path relative to the collection base, with extension
    // e.g. "en/agentic-4-pitfalls.mdx" → slug: "en/agentic-4-pitfalls"
    const slug = post.id.replace(/\.[^/.]+$/, '');
    return {
      params: { slug },
      props: { post },
    };
  });
};

// ─── Route handler ───────────────────────────────────────────────────────────
let avatarCache: string | null | undefined;

export const GET: APIRoute = async ({ props, params }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not Found', { status: 404 });

  const { post } = props;
  await ensureWasm();

  const zh = isZH(slug);
  const title: string = post.data.title;
  const description: string = post.data.description ?? '';
  const tag: string = post.data.tags?.[0] ?? (zh ? '写作' : 'Writing');
  const date = post.data.pubDate ? formatDate(new Date(post.data.pubDate), zh) : '';
  const author = 'Kieran Zhang';
  const url = 'kieranzhang.dev';

  // Load font based on language
  const titleFont = zh
    ? loadFont('NotoSerifSC-Regular.ttf')
    : loadFont('ShipporiMincho-Regular.ttf');

  // Load illustration for this post (inverted for dark background)
  const illustrationFile = pickIllustration(slug);
  const illustrationSrc = loadAndInvertPng(path.join(ILLUSTRATION_DIR, illustrationFile));

  // Load author avatar
  let avatarSrc: string | null = avatarCache;
  if (avatarSrc === undefined) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const avatarResp = await fetch('https://cdn.ninthbit.org/avatar.jpg', {
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (avatarResp.ok) {
        const avatarBuf = Buffer.from(await avatarResp.arrayBuffer());
        const mime = avatarBuf[0] === 0x89 && avatarBuf[1] === 0x50 ? 'image/png' : 'image/jpeg';
        avatarSrc = `data:${mime};base64,${avatarBuf.toString('base64')}`;
      }
    } catch {
      avatarSrc = null;
    }
    avatarCache = avatarSrc;
  }

  const titleFontName = zh ? 'Noto Serif SC' : 'Shippori Mincho';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          background: BG,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
        },
        children: [
          // Purple top bar
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 80,
                right: 0,
                height: 3,
                background: PURPLE,
              },
            },
          },
          // Left rail
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 80,
                width: 1,
                background: RAIL,
              },
            },
          },
          // Divider between text and illustration
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 3,
                bottom: 0,
                left: 740,
                width: 1,
                background: BORDER,
              },
            },
          },

          // ── Left text panel ──────────────────────────────────────
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 3,
                left: 80,
                bottom: 0,
                right: 460,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '60px 72px 60px 80px',
              },
              children: [
                // Tag + date row
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            padding: '4px 10px',
                            background: 'rgba(98,41,255,0.15)',
                            color: PURPLE_MID,
                            fontSize: 11,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            borderRadius: 4,
                            fontFamily: 'sans-serif',
                          },
                          children: tag,
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { color: FG3, fontSize: 13, fontFamily: 'sans-serif' },
                          children: date,
                        },
                      },
                    ],
                  },
                },
                // Title
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontFamily: `"${titleFontName}", Georgia, serif`,
                      fontSize: zh ? 52 : 50,
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.15,
                      color: FG,
                      margin: '0 0 20px',
                    },
                    children: title,
                  },
                },
                // Description
                ...(description
                  ? [
                      {
                        type: 'p',
                        props: {
                          style: {
                            fontSize: 18,
                            fontWeight: 300,
                            lineHeight: 1.7,
                            color: FG2,
                            marginBottom: 36,
                            fontFamily: 'sans-serif',
                          },
                          children: description,
                        },
                      },
                    ]
                  : [{ type: 'div', props: { style: { marginBottom: 36 } } }]),
                // Author row
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 8 },
                    children: [
                      ...(avatarSrc
                        ? [
                            {
                              type: 'img' as const,
                              props: {
                                src: avatarSrc,
                                style: {
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                },
                              },
                            },
                          ]
                        : []),
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: 13,
                            fontWeight: 400,
                            color: FG,
                            fontFamily: 'sans-serif',
                          },
                          children: author,
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 13, color: FG3, fontFamily: 'sans-serif' },
                          children: ' · ',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 13, color: FG3, fontFamily: 'sans-serif' },
                          children: url,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ── Right illustration panel ─────────────────────────────
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 3,
                right: 0,
                bottom: 0,
                width: 460,
                background: BG_PANEL,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: illustrationSrc,
                    style: {
                      width: 420,
                      height: 420,
                      objectFit: 'contain',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [{ name: titleFontName, data: titleFont, weight: 400 }],
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
};
