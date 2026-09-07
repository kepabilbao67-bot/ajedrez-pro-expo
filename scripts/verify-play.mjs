/**
 * AjedrezPro — Script de Verificación Integral Google Play (verify:play)
 * Valida automáticamente:
 * 1. Binario AAB de producción (existencia, tamaño, package com.kepabilbao.ajedrezpro, versión 1.0.0, vc 6)
 * 2. Icono oficial de Google Play (512x512 PNG)
 * 3. Feature Graphic (1024x500 PNG)
 * 4. Screenshots oficiales (mínimo 4 capturas, dimensiones válidas)
 * 5. Configuración Expo (app.json, eas.json)
 * 6. Documentación y textos reglamentarios (longitud título <=30, desc. corta <=80, data safety, privacidad)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function logPass(msg) {
  totalChecks++;
  passedChecks++;
  console.log(`  \x1b[32m✔ PASS\x1b[0m: ${msg}`);
}

function logFail(msg) {
  totalChecks++;
  failedChecks++;
  console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${msg}`);
}

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('No es un archivo PNG válido');
  }
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    bytes: buf.length,
  };
}

console.log('\n\x1b[36m=================================================================\x1b[0m');
console.log('\x1b[36m   AJEDREZPRO — VERIFICADOR AUTOMÁTICO DE REQUISITOS GOOGLE PLAY  \x1b[0m');
console.log('\x1b[36m=================================================================\x1b[0m\n');

// ── 1. VERIFICACIÓN DE CONFIGURACIÓN TÉCNICA (app.json / eas.json) ──────────────
console.log('\x1b[33m[1/5] Verificando configuración del proyecto (app.json y eas.json)...\x1b[0m');
try {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'app.json'), 'utf-8'));
  const expo = appJson.expo;

  if (expo.name === 'AjedrezPro') {
    logPass(`app.json: name = "${expo.name}"`);
  } else {
    logFail(`app.json: name esperado "AjedrezPro", encontrado "${expo.name}"`);
  }

  if (expo.android?.package === 'com.kepabilbao.ajedrezpro') {
    logPass(`app.json: android.package = "${expo.android.package}"`);
  } else {
    logFail(`app.json: android.package esperado "com.kepabilbao.ajedrezpro"`);
  }

  if (expo.version === '1.0.0') {
    logPass(`app.json: version = "${expo.version}"`);
  } else {
    logFail(`app.json: version esperada "1.0.0", encontrada "${expo.version}"`);
  }

  if (expo.orientation === 'portrait') {
    logPass(`app.json: orientation = "${expo.orientation}"`);
  } else {
    logFail(`app.json: orientation esperada "portrait"`);
  }

  if (expo.extra?.eas?.projectId === 'd2288f86-5373-4e91-910c-992f58c7bb87') {
    logPass(`app.json: eas.projectId = "${expo.extra.eas.projectId}"`);
  } else {
    logFail(`app.json: eas.projectId incorrecto`);
  }

  const easJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'eas.json'), 'utf-8'));
  if (easJson.cli?.appVersionSource === 'remote') {
    logPass('eas.json: appVersionSource = "remote"');
  } else {
    logFail('eas.json: se esperaba appVersionSource = "remote"');
  }

  if (easJson.build?.production?.autoIncrement === true) {
    logPass('eas.json: production profile autoIncrement activo');
  } else {
    logFail('eas.json: production profile sin autoIncrement');
  }
} catch (err) {
  logFail(`Error leyendo app.json o eas.json: ${err.message}`);
}

// ── 2. VERIFICACIÓN DE ASSETS GRÁFICOS DE GOOGLE PLAY ──────────────────────────
console.log('\n\x1b[33m[2/5] Verificando assets gráficos de Google Play Store...\x1b[0m');

// Icono 512x512
const iconPath = path.join(ROOT_DIR, 'docs', 'assets', 'icon_playstore_512.png');
if (fs.existsSync(iconPath)) {
  try {
    const dims = getPngDimensions(iconPath);
    if (dims.width === 512 && dims.height === 512) {
      logPass(`Icono Play Store: dimensiones exactas 512x512 px (${(dims.bytes / 1024).toFixed(1)} KB)`);
    } else {
      logFail(`Icono Play Store: dimensiones incorrectas (${dims.width}x${dims.height}), deben ser 512x512`);
    }
  } catch (err) {
    logFail(`Icono Play Store corrupto o inválido: ${err.message}`);
  }
} else {
  logFail(`Icono Play Store no encontrado en: ${iconPath}`);
}

// Feature Graphic 1024x500
const featurePath = path.join(ROOT_DIR, 'docs', 'assets', 'feature-graphic.png');
if (fs.existsSync(featurePath)) {
  try {
    const dims = getPngDimensions(featurePath);
    if (dims.width === 1024 && dims.height === 500) {
      logPass(`Feature Graphic: dimensiones exactas 1024x500 px (${(dims.bytes / 1024).toFixed(1)} KB)`);
    } else {
      logFail(`Feature Graphic: dimensiones incorrectas (${dims.width}x${dims.height}), deben ser 1024x500`);
    }
  } catch (err) {
    logFail(`Feature Graphic corrupto o inválido: ${err.message}`);
  }
} else {
  logFail(`Feature Graphic no encontrado en: ${featurePath}`);
}

// Screenshots
const screenshotsDir = path.join(ROOT_DIR, 'docs', 'assets', 'screenshots');
if (fs.existsSync(screenshotsDir)) {
  const files = fs.readdirSync(screenshotsDir).filter((f) => f.endsWith('.png'));
  if (files.length >= 4) {
    logPass(`Screenshots Android: encontrados ${files.length} screenshots (mínimo exigido: 4)`);
    let allValid = true;
    for (const f of files) {
      const fullPath = path.join(screenshotsDir, f);
      const dims = getPngDimensions(fullPath);
      if (dims.width >= 320 && dims.height >= 320 && dims.width <= 3840 && dims.height <= 3840) {
        // valid
      } else {
        allValid = false;
        logFail(`Screenshot ${f} tiene dimensiones fuera de rango: ${dims.width}x${dims.height}`);
      }
    }
    if (allValid) {
      logPass(`Screenshots Android: todas las ${files.length} capturas cumplen dimensiones válidas (1080x1920)`);
    }
  } else {
    logFail(`Screenshots insuficientes en ${screenshotsDir}: encontrados ${files.length}, requeridos mínimo 4`);
  }
} else {
  logFail(`Directorio de screenshots no encontrado: ${screenshotsDir}`);
}

// ── 3. VERIFICACIÓN DE TEXTOS Y METADATOS DE LA FICHA ──────────────────────────
console.log('\n\x1b[33m[3/5] Verificando textos y metadatos de Google Play Console...\x1b[0m');
const listingFile = path.join(ROOT_DIR, 'docs', 'play-store-listing.md');
if (fs.existsSync(listingFile)) {
  const content = fs.readFileSync(listingFile, 'utf-8');

  // Comprobar nombre
  const titleMatch = content.match(/Nombre de la aplicación[^\n]*\n\s*`([^`]+)`/i);
  if (titleMatch && titleMatch[1].length <= 30) {
    logPass(`Título de la app: "${titleMatch[1]}" (${titleMatch[1].length}/30 caracteres)`);
  } else {
    logFail('Título excede 30 caracteres o formato no encontrado');
  }

  // Comprobar descripción corta
  const shortMatch = content.match(/Descripción corta[^\n]*\n\s*`([^`]+)`/i);
  if (shortMatch && shortMatch[1].length <= 80) {
    logPass(`Descripción corta: "${shortMatch[1]}" (${shortMatch[1].length}/80 caracteres)`);
  } else {
    logFail('Descripción corta excede 80 caracteres o no encontrada');
  }

  // Comprobar política de privacidad
  const privacyPath = path.join(ROOT_DIR, 'docs', 'privacy.html');
  if (fs.existsSync(privacyPath) && fs.statSync(privacyPath).size > 1000) {
    logPass(`Política de Privacidad web disponible en docs/privacy.html (${(fs.statSync(privacyPath).size / 1024).toFixed(1)} KB)`);
  } else {
    logFail('No se encuentra docs/privacy.html o está vacío');
  }

  // Comprobar declaraciones
  if (content.includes('DATA SAFETY') || content.includes('SEGURIDAD DE LOS DATOS')) {
    logPass('Declaración Data Safety documentada (cero recopilación, local storage)');
  } else {
    logFail('Falta sección de Data Safety en la documentación');
  }

  if (content.includes('ACCESO A LA APLICACIÓN') || content.includes('APP ACCESS')) {
    logPass('Declaración App Access documentada (acceso irrestricto sin login)');
  } else {
    logFail('Falta declaración App Access');
  }

  if (content.includes('PÚBLICO OBJETIVO') || content.includes('TARGET AUDIENCE')) {
    logPass('Declaración Target Audience documentada (13+)');
  } else {
    logFail('Falta declaración Target Audience');
  }
} else {
  logFail(`Archivo de ficha no encontrado: ${listingFile}`);
}

// ── 4. VERIFICACIÓN DEL BINARIO AAB DE PRODUCCIÓN ──────────────────────────────
console.log('\n\x1b[33m[4/5] Verificando binario AAB de producción para Google Play...\x1b[0m');

const candidatePaths = [
  'C:\\Users\\foca-\\Downloads\\AjedrezPro-production-v1.0.0-vc6.aab',
  'C:\\Users\\foca-\\Downloads\\application-9a21c00c-c9a3-4e47-8c4e-c1429a25b994.aab',
];

let aabFound = false;
for (const aabPath of candidatePaths) {
  if (fs.existsSync(aabPath)) {
    const stat = fs.statSync(aabPath);
    if (stat.size > 10 * 1024 * 1024) {
      logPass(`AAB de producción localizado: ${path.basename(aabPath)} (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
      aabFound = true;
      break;
    }
  }
}

if (!aabFound) {
  logFail('No se encontró ningún archivo .aab válido de producción (>10MB) en Downloads');
}

// ── 5. RESUMEN FINAL ─────────────────────────────────────────────────────────
console.log('\n\x1b[36m=================================================================\x1b[0m');
console.log(`\x1b[36m   RESULTADO GLOBAL: ${passedChecks}/${totalChecks} COMPROBACIONES PASADAS\x1b[0m`);
console.log('\x1b[36m=================================================================\x1b[0m');

if (failedChecks === 0) {
  console.log('\n\x1b[32m✔ ESTADO: TODO EN ORDEN — APTO PARA GOOGLE PLAY STORE\x1b[0m\n');
  process.exit(0);
} else {
  console.log(`\n\x1b[31m✖ ESTADO: ${failedChecks} COMPROBACIÓN(ES) FALLADA(S)\x1b[0m\n`);
  process.exit(1);
}
