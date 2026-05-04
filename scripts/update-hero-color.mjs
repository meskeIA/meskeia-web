/**
 * Cambia el fondo del .hero de gradiente a var(--hero-bg) en todos los CSS modules.
 * Solo modifica la línea background dentro de bloques .hero { }, no afecta a
 * .tabla th, botones, ni ningún otro selector que use el mismo gradiente.
 *
 * Uso: node scripts/update-hero-color.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

const GRADIENT = 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)';
const NEW_VALUE = 'var(--hero-bg)';

// Obtiene todos los *.module.css de forma recursiva
function getCssFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...getCssFiles(full));
    } else if (entry.endsWith('.module.css')) {
      results.push(full);
    }
  }
  return results;
}

// Sustituye el gradiente SOLO dentro de bloques .hero { }
// Usa un parser de líneas con contador de llaves para precisión
function patchHeroBackground(content) {
  const lines = content.split('\n');
  let insideHero = false;
  let depth = 0;
  let changed = false;

  const patched = lines.map(line => {
    // Detectar inicio de bloque .hero { (puede tener espacios o no)
    if (!insideHero && /^\s*\.hero\s*\{/.test(line)) {
      insideHero = true;
      depth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      return line;
    }

    if (insideHero) {
      depth += (line.match(/\{/g) || []).length;
      depth -= (line.match(/\}/g) || []).length;

      // Fin del bloque .hero
      if (depth <= 0) {
        insideHero = false;
        return line;
      }

      // Sustituir el gradiente dentro del hero
      if (line.includes(GRADIENT)) {
        changed = true;
        return line.replace(GRADIENT, NEW_VALUE);
      }
    }

    return line;
  });

  return { content: patched.join('\n'), changed };
}

// ── Main ──────────────────────────────────────────────────────────────────────
const files = getCssFiles(appDir);
let modifiedCount = 0;
let skippedCount = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf-8');

  // Saltar archivos que ni siquiera contienen el gradiente
  if (!original.includes(GRADIENT)) {
    skippedCount++;
    continue;
  }

  const { content, changed } = patchHeroBackground(original);

  if (changed) {
    writeFileSync(file, content, 'utf-8');
    const rel = path.relative(path.join(__dirname, '..'), file);
    console.log(`  ✓ ${rel}`);
    modifiedCount++;
  }
}

console.log(`\n✅ Completado: ${modifiedCount} ficheros actualizados, ${skippedCount} sin cambios.`);
