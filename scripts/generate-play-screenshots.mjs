/**
 * AjedrezPro — Google Play Marketing Screenshots Generator (1080x1920)
 * Generates 5 high-resolution promotional screenshot cards.
 */

import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'assets', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const WIDTH = 1080;
const HEIGHT = 1920;

// CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function encodePngRgb(pixels, width, height) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per sample
  ihdr[9] = 2; // ColorType 2 = RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;
      const pxOffset = rowOffset + 1 + x * 3;
      rawData[pxOffset] = pixels[idx];
      rawData[pxOffset + 1] = pixels[idx + 1];
      rawData[pxOffset + 2] = pixels[idx + 2];
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const SCREENSHOT_CONFIGS = [
  {
    fileName: 'screenshot_1_ia_analysis.png',
    title: 'ANÁLISIS CON IA Y EVALUACIÓN',
    sub: 'Barra de ventaja animada y clasificación de jugadas brillantes',
    themePrimary: { r: 0, g: 229, b: 180 }, // #00E5B4
    boardColors: { light: { r: 233, g: 223, b: 201 }, dark: { r: 53, g: 97, b: 77 } },
  },
  {
    fileName: 'screenshot_2_eco_openings.png',
    title: '100+ APERTURAS ECO',
    sub: 'Enciclopedia de variantes y planes estratégicos en vivo',
    themePrimary: { r: 245, g: 196, b: 81 }, // #F5C451
    boardColors: { light: { r: 235, g: 210, b: 176 }, dark: { r: 122, g: 75, b: 41 } },
  },
  {
    fileName: 'screenshot_3_puzzle_rush.png',
    title: 'PUZZLE RUSH CONTRARRELOJ',
    sub: 'Modos 3 Min, 5 Min y Supervivencia (3 Vidas) con récord',
    themePrimary: { r: 0, g: 200, b: 255 }, // #00C8FF
    boardColors: { light: { r: 220, g: 234, b: 244 }, dark: { r: 43, g: 84, b: 126 } },
  },
  {
    fileName: 'screenshot_4_fide_clock.png',
    title: 'RELOJ DE TORNEO FIDE',
    sub: 'Blitz, Bullet y Rapid con incrementos Fischer para tablero físico',
    themePrimary: { r: 255, g: 77, b: 77 }, // #FF4D4D
    boardColors: { light: { r: 226, g: 232, b: 240 }, dark: { r: 74, g: 85, b: 104 } },
  },
  {
    fileName: 'screenshot_5_themes.png',
    title: '5 TEMAS DE TABLERO HD',
    sub: 'Esmeralda, Madera Nogal, Mármol de Carrara, Azul FIDE y Neón',
    themePrimary: { r: 183, g: 255, b: 0 }, // #B7FF00
    boardColors: { light: { r: 22, g: 78, b: 99 }, dark: { r: 8, g: 22, b: 34 } },
  },
];

console.log('Generating AjedrezPro Play Store Marketing Screenshots (1080x1920)...');

for (const cfg of SCREENSHOT_CONFIGS) {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 3);

  // Background Gradient (#09130F to #14241D with accented top glow)
  for (let y = 0; y < HEIGHT; y++) {
    const t = y / HEIGHT;
    const bgR = Math.round(9 * (1 - t) + 20 * t);
    const bgG = Math.round(19 * (1 - t) + 36 * t);
    const bgB = Math.round(15 * (1 - t) + 29 * t);

    for (let x = 0; x < WIDTH; x++) {
      const idx = (y * WIDTH + x) * 3;

      // Top glowing header banner
      if (y < 280) {
        const glowFactor = Math.max(0, 1 - (y / 280));
        pixels[idx] = Math.min(255, bgR + Math.round(cfg.themePrimary.r * 0.15 * glowFactor));
        pixels[idx + 1] = Math.min(255, bgG + Math.round(cfg.themePrimary.g * 0.15 * glowFactor));
        pixels[idx + 2] = Math.min(255, bgB + Math.round(cfg.themePrimary.b * 0.15 * glowFactor));
      } else {
        pixels[idx] = bgR;
        pixels[idx + 1] = bgG;
        pixels[idx + 2] = bgB;
      }
    }
  }

  // Draw Device Card / Mockup Area
  const boardSize = 880;
  const boardX = Math.round((WIDTH - boardSize) / 2);
  const boardY = 560;
  const squareSize = boardSize / 8;

  // Render 8x8 Chessboard mockup inside the card
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      const color = isLight ? cfg.boardColors.light : cfg.boardColors.dark;

      const startX = Math.round(boardX + col * squareSize);
      const startY = Math.round(boardY + row * squareSize);

      for (let y = startY; y < startY + squareSize && y < HEIGHT; y++) {
        for (let x = startX; x < startX + squareSize && x < WIDTH; x++) {
          const idx = (y * WIDTH + x) * 3;
          pixels[idx] = color.r;
          pixels[idx + 1] = color.g;
          pixels[idx + 2] = color.b;
        }
      }
    }
  }

  // Draw Card Frame & Accent Border
  const frameThick = 8;
  for (let y = boardY - frameThick; y < boardY + boardSize + frameThick && y < HEIGHT; y++) {
    for (let x = boardX - frameThick; x < boardX + boardSize + frameThick && x < WIDTH; x++) {
      const isBorder =
        y < boardY ||
        y >= boardY + boardSize ||
        x < boardX ||
        x >= boardX + boardSize;
      if (isBorder) {
        const idx = (y * WIDTH + x) * 3;
        pixels[idx] = cfg.themePrimary.r;
        pixels[idx + 1] = cfg.themePrimary.g;
        pixels[idx + 2] = cfg.themePrimary.b;
      }
    }
  }

  const png = encodePngRgb(pixels, WIDTH, HEIGHT);
  const destPath = path.join(OUT_DIR, cfg.fileName);
  fs.writeFileSync(destPath, png);
  console.log(`  ✓ Written: ${cfg.fileName} (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAll 5 Marketing Screenshots generated successfully in docs/assets/screenshots/\n');
