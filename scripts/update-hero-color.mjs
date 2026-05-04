/**
 * Cambia el fondo del .hero de gradiente a var(--hero-bg) en todos los CSS modules.
 * Solo modifica la línea background dentro de bloques .hero { }, no afecta a
 * .tabla th, botones, ni ningún otro selector que use el mismo gradiente.
 *
 * Reconoce tres variantes del gradiente:
 *   1. linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)
 *   2. linear-gradient(135deg, var(--primary, #2E86AB) 0%, var(--secondary, #48A9A6) 100%)
 *   3. linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%)
 *
 * Uso: node scripts/update-hero-color.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

const NEW_VALUE = 'var(--hero-bg)';

// Patrón que reconoce las tres variantes del gradiente meskeIA en el hero
const GRADIENT_RE = /linear-gradient\(135deg,\s*(?:var\(--primary(?:,\s*#2E86AB)?\)|#2E86AB)\s+0%,\s*(?:var\(--secondary(?:,\s*#48A9A6)?\)|#48A9A6)\s+100%\)/i;

// Para el pre-filtro rápido (evitar parsear archivos sin ninguna variante)
// Nota: sin ) para que capture también la forma con fallback var(--primary, #2E86AB)
const QUICK_MARKERS = [
  'linear-gradient(135deg, var(--primary',
  'linear-gradient(135deg, #2E86AB',
];

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
    // Caso especial: .hero { ... } todo en una sola línea
    if (!insideHero && /^\s*\.hero\s*\{/.test(line) && /\}/.test(line)) {
      if (GRADIENT_RE.test(line)) {
        changed = true;
        return line.replace(GRADIENT_RE, NEW_VALUE);
      }
      return line;
    }

    // Detectar inicio de bloque .hero { multilínea
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

      // Sustituir cualquier variante del gradiente dentro del hero
      if (GRADIENT_RE.test(line)) {
        changed = true;
        return line.replace(GRADIENT_RE, NEW_VALUE);
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

  // Saltar archivos que no contienen ninguna variante del gradiente
  if (!QUICK_MARKERS.some(m => original.includes(m))) {
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
