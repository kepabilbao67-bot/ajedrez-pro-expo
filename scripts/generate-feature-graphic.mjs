/**
 * AjedrezPro — Feature Graphic Generator (Google Play Store)
 * Generates the official 1024x500 Feature Graphic PNG using pure Node.js Buffer.
 * Palette: Deep Emerald (#09130F), Emerald Card (#14241D), Gold (#D6A943).
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'assets');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const EMERALD_DARK = { r: 9, g: 19, b: 15 };    // #09130F
const EMERALD_MID  = { r: 20, g: 36, b: 29 };   // #14241D
const EMERALD_LIGHT= { r: 34, g: 54, b: 44 };   // #22362C
const GOLD         = { r: 214, g: 169, b: 67 }; // #D6A943
const GOLD_LIGHT   = { r: 246, g: 230, b: 189};// #F6E6BD

// ─── Geometry ─────────────────────────────────────────────────────────────────
const KNIGHT_POLY = [
  [0.33, 0.82], [0.67, 0.82],
  [0.67, 0.72], [0.62, 0.72],
  [0.65, 0.60], [0.70, 0.45], [0.72, 0.30],
  [0.68, 0.22], [0.60, 0.18],
  [0.62, 0.28], [0.56, 0.32],
  [0.48, 0.18], [0.38, 0.22],
  [0.40, 0.15], [0.44, 0.22],
  [0.36, 0.28], [0.30, 0.38],
  [0.28, 0.50], [0.30, 0.62],
  [0.35, 0.72], [0.33, 0.72],
];

const EYE_CENTER = [0.525, 0.245];
const EYE_RADIUS = 0.025;
const CROWN_NOTCH = [[0.42, 0.185], [0.455, 0.16], [0.49, 0.185]];

function pointInPolygon(px, py, polygon) {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) &&
      (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isKnightPixel(nx, ny) {
  if (pointInPolygon(nx, ny, CROWN_NOTCH)) return false;
  const dx = nx - EYE_CENTER[0];
  const dy = ny - EYE_CENTER[1];
  if (Math.sqrt(dx * dx + dy * dy) < EYE_RADIUS) return false;
  return pointInPolygon(nx, ny, KNIGHT_POLY);
}

// ─── PNG Encoder ──────────────────────────────────────────────────────────────
function crc32(buf) {
  const table = crc32.table ??= (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcData = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

function encodePng(pixels, width, height) {
  const channels = 3; // RGB
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * channels);
    row[0] = 0;
    for (let x = 0; x < width; x++) {
      const p = pixels[y * width + x];
      const base = 1 + x * channels;
      row[base]     = p.r;
      row[base + 1] = p.g;
      row[base + 2] = p.b;
    }
    rawRows.push(row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type 2 = RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Render Feature Graphic (1024x500 RGB) ────────────────────────────────────
const WIDTH = 1024;
const HEIGHT = 500;
const pixels = [];

// Knight placement: centered slightly to the right
// box: x in [560, 940], y in [60, 440]
const kSize = 360;
const kLeft = 580;
const kTop = 70;

const AA = 2;

for (let y = 0; y < HEIGHT; y++) {
  const ny = y / HEIGHT;
  for (let x = 0; x < WIDTH; x++) {
    const nx = x / WIDTH;

    // Background radial gradient centered at (650, 250)
    const bgDx = (x - 680) / WIDTH;
    const bgDy = (y - 250) / HEIGHT;
    const bgDist = Math.sqrt(bgDx * bgDx + bgDy * bgDy);
    const bgT = Math.min(1, bgDist * 1.6);

    let r = Math.round(EMERALD_MID.r * (1 - bgT) + EMERALD_DARK.r * bgT);
    let g = Math.round(EMERALD_MID.g * (1 - bgT) + EMERALD_DARK.g * bgT);
    let b = Math.round(EMERALD_MID.b * (1 - bgT) + EMERALD_DARK.b * bgT);

    // Subtle chessboard pattern background grid in background (left side)
    const gridSize = 40;
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    if ((gridX + gridY) % 2 === 1 && x < 500) {
      r = Math.min(255, r + 4);
      g = Math.min(255, g + 6);
      b = Math.min(255, b + 5);
    }

    // Knight rendering
    if (x >= kLeft && x < kLeft + kSize && y >= kTop && y < kTop + kSize) {
      let covered = 0;
      for (let sy = 0; sy < AA; sy++) {
        for (let sx = 0; sx < AA; sx++) {
          const subX = (x - kLeft + (sx + 0.5) / AA) / kSize;
          const subY = (y - kTop + (sy + 0.5) / AA) / kSize;
          if (isKnightPixel(subX, subY)) covered++;
        }
      }
      const alpha = covered / (AA * AA);
      if (alpha > 0) {
        // Gold gradient on knight
        const subY = (y - kTop) / kSize;
        const kr = Math.round(GOLD_LIGHT.r * (1 - subY) + GOLD.r * subY);
        const kg = Math.round(GOLD_LIGHT.g * (1 - subY) + GOLD.g * subY);
        const kb = Math.round(GOLD_LIGHT.b * (1 - subY) + GOLD.b * subY);

        r = Math.round(kr * alpha + r * (1 - alpha));
        g = Math.round(kg * alpha + g * (1 - alpha));
        b = Math.round(kb * alpha + b * (1 - alpha));
      }
    }

    pixels.push({ r, g, b });
  }
}

const outPng = encodePng(pixels, WIDTH, HEIGHT);
const outPath = path.join(OUT_DIR, 'feature-graphic.png');
fs.writeFileSync(outPath, outPng);

console.log(`Feature Graphic written to: ${outPath} (${outPng.length} bytes, 1024x500 RGB)`);
