/**
 * Añade el campo `images` a los bloques openGraph y twitter de cada metadata.ts
 * de las apps. También corrige el bug del subdominio next.meskeia.com.
 *
 * En Next.js, cuando una página hija define openGraph/twitter, sustituye por
 * completo al del padre (no se mergea). Sin `images`, las apps pierden la
 * og:image heredada del layout root.
 *
 * Uso: node scripts/add-og-images.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

const OG_IMAGE_URL = 'https://meskeia.com/og-image.png';

const OG_IMAGES_BLOCK = `,
    images: [{
      url: '${OG_IMAGE_URL}',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]`;

const TW_IMAGES_BLOCK = `,
    images: ['${OG_IMAGE_URL}']`;

// Encuentra todos los app/<slug>/metadata.ts (no recursivo profundo,
// solo el primer nivel de carpetas dentro de app/)
function getMetadataFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (!statSync(full).isDirectory()) continue;
    const metaPath = path.join(full, 'metadata.ts');
    if (existsSync(metaPath)) results.push(metaPath);
    // También buscar un nivel más profundo (guia/<slug>/metadata.ts, etc.)
    for (const sub of readdirSync(full)) {
      const subFull = path.join(full, sub);
      if (!statSync(subFull).isDirectory()) continue;
      const subMeta = path.join(subFull, 'metadata.ts');
      if (existsSync(subMeta)) results.push(subMeta);
    }
  }
  return results;
}

// Inserta `images` antes del cierre `},` de un bloque (openGraph o twitter)
// Usa regex no-greedy. Asume que los bloques no tienen objetos anidados.
function insertImagesInBlock(content, blockName, imagesBlock) {
  // Si el bloque ya tiene images, no tocar
  const hasImagesRe = new RegExp(`${blockName}:\\s*\\{[^}]*?images\\s*:`, 's');
  if (hasImagesRe.test(content)) return { content, changed: false };

  // Localizar el bloque y la última propiedad antes de su cierre
  // Pattern: blockName: { ... última: 'valor', \n  },
  // Reemplazamos eliminando la coma final tras la última prop e insertando
  // images antes del cierre
  const re = new RegExp(`(${blockName}:\\s*\\{[^}]*?[^,\\s])(,?)(\\s*\\n\\s*\\},)`, 's');
  if (!re.test(content)) return { content, changed: false };

  const newContent = content.replace(re, (match, body, trailingComma, closing) => {
    return `${body}${imagesBlock}${closing}`;
  });

  return { content: newContent, changed: newContent !== content };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = getMetadataFiles(appDir);
let modifiedCount = 0;
let skippedCount = 0;
let urlFixedCount = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf-8');
  let content = original;
  let changed = false;

  // 1. Corregir bug next.meskeia.com → meskeia.com
  if (content.includes('next.meskeia.com')) {
    content = content.replace(/https:\/\/next\.meskeia\.com/g, 'https://meskeia.com');
    urlFixedCount++;
    changed = true;
  }

  // 2. Añadir images al bloque openGraph
  const ogResult = insertImagesInBlock(content, 'openGraph', OG_IMAGES_BLOCK);
  content = ogResult.content;
  if (ogResult.changed) changed = true;

  // 3. Añadir images al bloque twitter
  const twResult = insertImagesInBlock(content, 'twitter', TW_IMAGES_BLOCK);
  content = twResult.content;
  if (twResult.changed) changed = true;

  if (changed) {
    writeFileSync(file, content, 'utf-8');
    const rel = path.relative(path.join(__dirname, '..'), file);
    console.log(`  ✓ ${rel}`);
    modifiedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\n✅ Completado:`);
console.log(`   ${modifiedCount} ficheros actualizados`);
console.log(`   ${skippedCount} sin cambios`);
console.log(`   ${urlFixedCount} URLs corregidas (next.meskeia.com → meskeia.com)`);
