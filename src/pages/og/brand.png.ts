/**
 * ZenBlog — Static brand OG image
 * Route: /og/brand.png
 *
 * Used for the homepage and any page without a specific OG image.
 * Referenced in BaseHead.astro as the fallback og:image.
 *
 * Deps: satori  @resvg/resvg-wasm
 */

import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { readFileSync } from 'fs';
import path from 'path';
import { createRequire } from 'node:module';

// ─── WASM init (runs once per cold start) ───────────────────────────────────
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

// ─── Colors (ZenBlog tokens) ─────────────────────────────────────────────────
const BG = '#09090b'; // zinc-950
const FG = 'rgba(255,255,255,0.87)';
const FG2 = '#a1a1aa'; // zinc-400
const PURPLE = '#6229FF';
const PURPLE_L = '#C3BDFF'; // brand-200
const RAIL = 'rgba(255,255,255,0.14)';

// ─── Route handler ───────────────────────────────────────────────────────────
export const GET: APIRoute = async () => {
  await ensureWasm();

  const shippori = loadFont('ShipporiMincho-Regular.ttf');

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          background: BG,
          display: 'flex',
          position: 'relative',
          fontFamily: '"Shippori Mincho", Georgia, serif',
          overflow: 'hidden',
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
                right: 80,
                height: 3,
                background: PURPLE,
              },
            },
          },
          // Left rail line
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
          // Right rail line
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 80,
                width: 1,
                background: RAIL,
              },
            },
          },
          // Content
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 0,
                left: 80,
                right: 80,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '60px 80px',
                gap: 80,
              },
              children: [
                // Left — text
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      flex: '0 0 520px',
                    },
                    children: [
                      // URL label
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 28,
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: PURPLE,
                                },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: 13,
                                  letterSpacing: '0.2em',
                                  textTransform: 'uppercase',
                                  color: FG2,
                                  fontFamily: 'sans-serif',
                                },
                                children: 'ninthbit.org',
                              },
                            },
                          ],
                        },
                      },
                      // Name
                      {
                        type: 'h1',
                        props: {
                          style: {
                            fontSize: 72,
                            fontWeight: 400,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.1,
                            color: FG,
                            margin: '0 0 16px',
                          },
                          children: 'Kieran Zhang',
                        },
                      },
                      // Tagline
                      {
                        type: 'p',
                        props: {
                          style: {
                            fontSize: 13,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: FG2,
                            marginBottom: 24,
                            fontFamily: 'sans-serif',
                          },
                          children: 'AI Build · Photography · Writing',
                        },
                      },
                      // Intro
                      {
                        type: 'p',
                        props: {
                          style: {
                            fontSize: 18,
                            fontWeight: 300,
                            lineHeight: 1.75,
                            color: FG,
                            fontFamily: 'sans-serif',
                          },
                          children:
                            'I build software and shoot film. Writing about engineering, visual minimalism, and the tools I use to think.',
                        },
                      },
                    ],
                  },
                },
                // Right — accent circle placeholder
                {
                  type: 'div',
                  props: {
                    style: {
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            width: 320,
                            height: 320,
                            borderRadius: '50%',
                            background: 'rgba(98,41,255,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: 120,
                                  height: 4,
                                  background: PURPLE_L,
                                  borderRadius: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
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
      fonts: [{ name: 'Shippori Mincho', data: shippori, weight: 400 }],
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
