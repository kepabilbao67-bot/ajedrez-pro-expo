/**
 * AjedrezPro — Icon Generator
 * Generates all required app icons using pure Node.js (no external deps).
 * Uses a geometric chess knight SVG rendered to PNG via canvas-less approach.
 *
 * This script creates a minimal valid PNG from scratch using Node.js Buffer.
 * The design: geometric golden knight (#D6A943) on emerald (#09130F).
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

// ─── Colors ───────────────────────────────────────────────────────────────────
const EMERALD = { r: 9, g: 19, b: 15 };       // #09130F
const GOLD    = { r: 214, g: 169, b: 67 };    // #D6A943
const WHITE   = { r: 255, g: 255, b: 255 };   // #FFFFFF
const TRANSPARENT = { r: 0, g: 0, b: 0, a: 0 };

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

function encodePng(pixels, width, height, hasAlpha) {
  const channels = hasAlpha ? 4 : 3;
  const colorType = hasAlpha ? 6 : 2; // 6=RGBA, 2=RGB
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * channels);
    row[0] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const p = pixels[y * width + x];
      const base = 1 + x * channels;
      row[base]   = p.r ?? 0;
      row[base+1] = p.g ?? 0;
      row[base+2] = p.b ?? 0;
      if (hasAlpha) row[base+3] = p.a ?? 255;
    }
    rawRows.push(row);
  }
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;          // bit depth
  ihdr[9] = colorType;  // color type
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
}

/**
 * Point-in-polygon (ray casting)
 * polygon: array of [x, y] pairs
 */
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

// ─── Knight silhouette (normalized 0..1) ────────────────────────────────────
// A stylized geometric chess knight facing right, filling ~0.55 of canvas height
// Coordinates are (x, y) in 0..1 space
const KNIGHT_POLY_NORMALIZED = [
  // base (bottom)
  [0.33, 0.82], [0.67, 0.82],
  // right leg
  [0.67, 0.72], [0.62, 0.72],
  // body right side going up
  [0.65, 0.60], [0.70, 0.45], [0.72, 0.30],
  // head top-right
  [0.68, 0.22], [0.60, 0.18],
  // snout/nose area
  [0.62, 0.28], [0.56, 0.32],
  // forehead curve (left side of head)
  [0.48, 0.18], [0.38, 0.22],
  // ear
  [0.40, 0.15], [0.44, 0.22],
  // back of head going down
  [0.36, 0.28], [0.30, 0.38],
  // neck/chest
  [0.28, 0.50], [0.30, 0.62],
  // left leg
  [0.35, 0.72], [0.33, 0.72],
];

const EYE_CENTER = [0.525, 0.245];
const EYE_RADIUS = 0.025;

// Crown/notch on head (triangle cutout to add detail)
const CROWN_NOTCH = [
  [0.42, 0.185], [0.455, 0.16], [0.49, 0.185]
];

/**
 * Returns true if pixel (nx, ny) in 0..1 space is inside the knight shape.
 */
function isKnightPixel(nx, ny) {
  // Main body
  if (!pointInPolygon(nx, ny, KNIGHT_POLY_NORMALIZED)) return false;
  // Eye cutout
  if (dist(nx, ny, EYE_CENTER[0], EYE_CENTER[1]) < EYE_RADIUS) return false;
  // Crown notch (subtractive)
  if (pointInPolygon(nx, ny, CROWN_NOTCH)) return false;
  return true;
}

// ─── Canvas renderers ─────────────────────────────────────────────────────────

/**
 * Renders a full-color icon (RGB, no alpha).
 * background: color object, knight: color object
 */
function renderIcon(size, bgColor, knightColor) {
  const pixels = [];
  const AA = 2; // 2x super-sampling
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Super-sample
      let covered = 0;
      for (let sy = 0; sy < AA; sy++) {
        for (let sx = 0; sx < AA; sx++) {
          const nx = (x + (sx + 0.5) / AA) / size;
          const ny = (y + (sy + 0.5) / AA) / size;
          if (isKnightPixel(nx, ny)) covered++;
        }
      }
      const ratio = covered / (AA * AA);
      pixels.push({
        r: Math.round(bgColor.r * (1 - ratio) + knightColor.r * ratio),
        g: Math.round(bgColor.g * (1 - ratio) + knightColor.g * ratio),
        b: Math.round(bgColor.b * (1 - ratio) + knightColor.b * ratio),
      });
    }
  }
  return pixels;
}

/**
 * Renders a foreground layer with transparency.
 * The knight is drawn in knightColor, everything else is transparent.
 */
function renderForeground(size, knightColor) {
  const pixels = [];
  const AA = 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let covered = 0;
      for (let sy = 0; sy < AA; sy++) {
        for (let sx = 0; sx < AA; sx++) {
          const nx = (x + (sx + 0.5) / AA) / size;
          const ny = (y + (sy + 0.5) / AA) / size;
          if (isKnightPixel(nx, ny)) covered++;
        }
      }
      const alpha = Math.round((covered / (AA * AA)) * 255);
      pixels.push({
        r: knightColor.r,
        g: knightColor.g,
        b: knightColor.b,
        a: alpha,
      });
    }
  }
  return pixels;
}

/**
 * Renders monochrome: white knight, transparent background.
 */
function renderMonochrome(size) {
  return renderForeground(size, WHITE);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SIZE = 1024;
const FAVICON_SIZE = 192;

console.log('AjedrezPro Icon Generator');
console.log('Output:', OUT_DIR);
console.log('');

// icon.png — full RGB 1024×1024
console.log('Generating icon.png (1024x1024 RGB)...');
{
  const pixels = renderIcon(SIZE, EMERALD, GOLD);
  const png = encodePng(pixels, SIZE, SIZE, false);
  fs.writeFileSync(path.join(OUT_DIR, 'icon.png'), png);
  console.log(`  Written: ${png.length} bytes`);
}

// android-icon-foreground.png — RGBA 1024×1024, transparent bg
console.log('Generating android-icon-foreground.png (1024x1024 RGBA)...');
{
  const pixels = renderForeground(SIZE, GOLD);
  const png = encodePng(pixels, SIZE, SIZE, true);
  fs.writeFileSync(path.join(OUT_DIR, 'android-icon-foreground.png'), png);
  console.log(`  Written: ${png.length} bytes`);
}

// android-icon-monochrome.png — RGBA 1024×1024, white knight on transparent
console.log('Generating android-icon-monochrome.png (1024x1024 RGBA)...');
{
  const pixels = renderMonochrome(SIZE);
  const png = encodePng(pixels, SIZE, SIZE, true);
  fs.writeFileSync(path.join(OUT_DIR, 'android-icon-monochrome.png'), png);
  console.log(`  Written: ${png.length} bytes`);
}

// splash-icon.png — RGBA 1024×1024, white knight on transparent
console.log('Generating splash-icon.png (1024x1024 RGBA)...');
{
  const pixels = renderMonochrome(SIZE);
  const png = encodePng(pixels, SIZE, SIZE, true);
  fs.writeFileSync(path.join(OUT_DIR, 'splash-icon.png'), png);
  console.log(`  Written: ${png.length} bytes`);
}

// favicon.png — 192×192 RGB
console.log('Generating favicon.png (192x192 RGB)...');
{
  const pixels = renderIcon(FAVICON_SIZE, EMERALD, GOLD);
  const png = encodePng(pixels, FAVICON_SIZE, FAVICON_SIZE, false);
  fs.writeFileSync(path.join(OUT_DIR, 'favicon.png'), png);
  console.log(`  Written: ${png.length} bytes`);
}

// Remove android-icon-background.png (will use backgroundColor in app.json)
const bgPath = path.join(OUT_DIR, 'android-icon-background.png');
if (fs.existsSync(bgPath)) {
  fs.unlinkSync(bgPath);
  console.log('Removed android-icon-background.png (using backgroundColor instead)');
}

console.log('');
console.log('All icons generated successfully.');

// ─── Verify ───────────────────────────────────────────────────────────────────
const files = ['icon.png','android-icon-foreground.png','android-icon-monochrome.png','splash-icon.png','favicon.png'];
console.log('\nVerification:');
files.forEach(f => {
  const p = path.join(OUT_DIR, f);
  const buf = fs.readFileSync(p);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const ct = buf[25];
  const ctName = {0:'Grey',2:'RGB',3:'Indexed',4:'GreyA',6:'RGBA'}[ct] || 'Unknown';
  const hasAlpha = ct === 6 || ct === 4;
  console.log(`  ${f}: ${w}x${h} ${ctName} ${hasAlpha ? '✓ hasAlpha' : '  no alpha'} ${buf.length}B`);
});
