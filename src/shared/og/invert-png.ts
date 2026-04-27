/**
 * Pure-JS PNG inversion — inverts RGB channels for dark-mode OG illustrations.
 * No external dependencies. Handles RGBA, RGB, indexed 8-bit non-interlaced PNGs.
 */
import { inflateSync, deflateSync } from 'zlib';
import { readFileSync } from 'fs';

// Standard PNG filters
function paethPredictor(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilterRow(curr: Buffer, prev: Buffer, bpp: number, filter: number): void {
  const len = curr.length;
  if (filter === 0) return; // None
  for (let i = 0; i < len; i++) {
    const left = i >= bpp ? curr[i - bpp] : 0;
    const above = prev[i];
    const aboveLeft = i >= bpp ? prev[i - bpp] : 0;
    if (filter === 1)
      curr[i] = (curr[i] + left) & 0xff; // Sub
    else if (filter === 2)
      curr[i] = (curr[i] + above) & 0xff; // Up
    else if (filter === 3)
      curr[i] = (curr[i] + ((left + above) >> 1)) & 0xff; // Average
    else if (filter === 4) curr[i] = (curr[i] + paethPredictor(left, above, aboveLeft)) & 0xff; // Paeth
  }
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeB, data]);
  const crc = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeB, data, crcBuf]);
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const BPP_BY_COLOR_TYPE: Record<number, number> = {
  2: 3, // RGB
  3: 1, // Indexed (palette-based, handled separately)
  6: 4, // RGBA
};

export function loadAndInvertPng(filePath: string): string {
  const src = readFileSync(filePath);

  // Parse PNG chunks
  let offset = 8; // skip signature
  const preChunks: Buffer[] = [];
  const idatParts: Buffer[] = [];
  let ihdrData: Buffer | null = null;
  let plteData: Buffer | null = null;

  while (offset < src.length) {
    const len = src.readUInt32BE(offset);
    const type = src.toString('ascii', offset + 4, offset + 8);
    const data = src.subarray(offset + 8, offset + 8 + len);

    if (type === 'IDAT') {
      idatParts.push(data);
    } else if (idatParts.length === 0) {
      preChunks.push(src.subarray(offset, offset + 12 + len));
      if (type === 'IHDR') ihdrData = data;
      if (type === 'PLTE') plteData = data;
    }
    // post-IDAT chunks ignored

    offset += 12 + len;
  }

  if (!ihdrData) throw new Error('PNG missing IHDR');

  const width = ihdrData.readUInt32BE(0);
  const height = ihdrData.readUInt32BE(4);
  const bitDepth = ihdrData.readUInt8(8);
  const colorType = ihdrData.readUInt8(9);
  const interlace = ihdrData.readUInt8(12);

  if (bitDepth !== 8)
    throw new Error(`Unsupported PNG bit depth: ${bitDepth} (only 8-bit supported)`);
  if (interlace !== 0) throw new Error('Interlaced PNG not supported');

  const bpp = BPP_BY_COLOR_TYPE[colorType];
  if (bpp === undefined) throw new Error(`Unsupported PNG color type: ${colorType}`);

  // For indexed PNGs, invert the palette instead of pixel data.
  // Pixel indices stay the same so we can reuse the compressed IDAT as-is.
  if (colorType === 3) {
    if (!plteData) throw new Error('Indexed PNG missing PLTE chunk');

    const invertedPlte = Buffer.alloc(plteData.length);
    plteData.copy(invertedPlte);
    for (let i = 0; i < invertedPlte.length; i += 3) {
      invertedPlte[i] = 255 - invertedPlte[i];
      invertedPlte[i + 1] = 255 - invertedPlte[i + 1];
      invertedPlte[i + 2] = 255 - invertedPlte[i + 2];
    }

    // Replace PLTE in preChunks with inverted version
    const plteIndex = preChunks.findIndex((chunk) => {
      return chunk.length >= 8 && chunk.toString('ascii', 4, 8) === 'PLTE';
    });
    if (plteIndex >= 0) {
      preChunks[plteIndex] = pngChunk('PLTE', invertedPlte);
    }

    const sig = src.subarray(0, 8);
    const iend = pngChunk('IEND', Buffer.alloc(0));
    const result = Buffer.concat([
      sig,
      ...preChunks,
      ...idatParts.map((d) => pngChunk('IDAT', d)),
      iend,
    ]);
    return `data:image/png;base64,${result.toString('base64')}`;
  }

  // Decompress, unfilter, invert RGB, re-filter
  const raw = inflateSync(Buffer.concat(idatParts));
  const stride = width * bpp;
  const out = Buffer.alloc(raw.length);
  const prevRow = Buffer.alloc(stride);
  const currRow = Buffer.alloc(stride);
  let srcPos = 0;
  let dstPos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[srcPos++];
    raw.copy(currRow, 0, srcPos, srcPos + stride);
    srcPos += stride;

    unfilterRow(currRow, prevRow, bpp, filter);

    for (let i = 0; i < stride; i += bpp) {
      currRow[i] = 255 - currRow[i];
      currRow[i + 1] = 255 - currRow[i + 1];
      currRow[i + 2] = 255 - currRow[i + 2];
    }

    out[dstPos++] = 0; // filter None
    currRow.copy(out, dstPos, 0, stride);
    dstPos += stride;
    currRow.copy(prevRow);
  }

  const newIdat = pngChunk('IDAT', deflateSync(out));

  const sig = src.subarray(0, 8);
  const iend = pngChunk('IEND', Buffer.alloc(0));
  const result = Buffer.concat([sig, ...preChunks, newIdat, iend]);

  return `data:image/png;base64,${result.toString('base64')}`;
}
