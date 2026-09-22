#!/usr/bin/env node
/**
 * Script: check-contraste-cabeceras.mjs
 *
 * Candado del CONTRASTE DE LAS CABECERAS DE TABLA. Se ejecuta antes de cada build
 * (`npm run build`) y a mano con `npm run check:contraste-cabeceras`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Una cabecera de tabla (`<th>`, `<thead>`, la clase `.th`) con TEXTO BLANCO encima de un
 * fondo `var(--primary)` o `var(--secondary)`. Los colores de marca son identidad, no
 * contraste: como fondo de un texto blanco dan
 *
 *     blanco sobre --primary   #2E86AB → 4,11:1   (y 2,79:1 en oscuro, donde aclara a #3FA5D1)
 *     blanco sobre --secondary #48A9A6 → 2,80:1   (y 2,23:1 en oscuro)
 *
 * y un `<th>` es negrita de ~14-16px, o sea texto pequeño: exige 4,5:1. Los tokens que sí
 * valen existen desde el 21/08/2026 y se crearon para exactamente esto:
 *
 *     var(--primary-boton)    #26718F → 5,47:1   EN AMBOS TEMAS
 *     var(--secondary-boton)  #327874 → 5,15:1   EN AMBOS TEMAS
 *
 * `var(--hero-bg)` NO lo enciende: con blanco encima da 8,33:1 y cumple de sobra.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del hallazgo 1175 del Inspector (21/09/2026), que fue la TERCERA vuelta sobre la misma
 * tabla de `simulador-gastos-compraventa-nave-industrial`: el 648 arregló las celdas de
 * respuesta y el 684 la de la cifra, y las tres veces se midió el TEXTO de las celdas
 * mientras la fila del `<thead>` no se medía nunca, porque su color no está en el texto
 * sino en el FONDO. Esa es justo la clase de defecto que un ojo humano no ve leyendo el
 * diff y un script demuestra por la forma del código.
 *
 * El barrido del 22/09/2026 encontró que no era un caso aislado: **683 bloques de `<th>` en
 * 518 ficheros** hacían lo mismo, y 389 de ellos fallaban además en tema oscuro. Se drenaron
 * todos en el commit que crea este candado, incluidos 3 que seguían EN LÍNEA en el JSX —
 * `selector-modelo-negocio`, `simulador-gastos-compraventa-local-comercial` y
 * `-solar`—, gemelos exactos del 1175 en apps hermanas que aquella reparación dejó atrás.
 *
 * SIN PASIVO
 * ──────────
 * Barre el árbol ENTERO, como `check:og-image` y a diferencia de `check:a11y-jsx`: el
 * drenaje quedó completo, así que solo puede encenderlo código nuevo. Si algún día se
 * quedara pasivo sin drenar, habría que pasarlo a juzgar únicamente las líneas añadidas y
 * decirlo AQUÍ, con el motivo.
 *
 * LAS DOS SUPERFICIES
 * ───────────────────
 *   A. `app/**\/*.module.css` — el grueso: un bloque de `<th>`/`<thead>`/`.th` con fondo de
 *      marca. El texto blanco cuenta aunque esté en un selector HERMANO de la misma tabla:
 *      el patrón `.tabla thead tr { background }` + `.tabla th { color: white }` reparte el
 *      fondo y el color entre dos reglas, y 17 casos del drenaje tenían esa forma.
 *   B. `app/**\/*.tsx` — el estilo EN LÍNEA, que es la forma exacta del caso de origen:
 *      `<tr style={{ background: 'var(--primary)', color: '#fff' }}>`. Sin esta segunda
 *      superficie el candado no detectaría el caso del que nació.
 *
 * QUÉ NO MIRA
 * ───────────
 *   · El color de marca como TEXTO sobre fondo claro (`color: var(--primary)`, 4,11:1), que
 *     se resuelve con `--primary-texto` y es otra población, todavía sin drenar.
 *   · Los fondos teñidos `color-mix(in srgb, var(--primary) 6-20%, …)`: son casi el fondo de
 *     la tarjeta y llevan texto oscuro. Solo se encienden si además hay texto blanco.
 *   · Los botones, badges y números de paso con fondo de marca (2.042 bloques medidos el
 *     22/09/2026): campaña aparte, porque cambiarlos altera el aspecto de la interacción.
 *
 * ESCAPE
 * ──────
 * `contraste-ok: <razón>` en esa línea o en la anterior. **La razón es obligatoria**: la
 * marca a secas también rompe el build, igual que en `check:legal`.
 *
 * Sus casos de prueba están en `scripts/pruebas/contraste-cabeceras/`, y se le reinyectan
 * con `npm run contraste:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;
const VERBOSO = process.argv.includes('--todo');

// ─── Tokens ────────────────────────────────────────────────────────────────────
const RE_MARCA_FONDO = /var\(\s*--(primary|secondary)\s*\)/;
const RE_BLANCO = /^(#fff|#ffffff|white)$/i;
const SUSTITUTO = { primary: '--primary-boton', secondary: '--secondary-boton' };

// ─── Escape ────────────────────────────────────────────────────────────────────
const RE_ESCAPE = /contraste-ok:/;

/**
 * Clasifica un texto candidato: 'firmado' si el escape trae una razón de verdad,
 * 'sin razón' si está la marca a secas, null si no hay escape.
 *
 * La razón tiene que ser PALABRAS. El cierre del comentario (`*&#47;`) no cuenta: con un
 * `\S+` a secas, `/* contraste-ok: *&#47;` se daba por firmado y el escape quedaba abierto
 * de par en par, que es justo lo que este candado no puede permitirse.
 */
function clasificarEscape(texto) {
  const m = texto.match(/contraste-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

/**
 * Busca el escape en la línea del hallazgo y en el COMENTARIO que la precede, entero.
 *
 * Mirar solo "la línea anterior", como hacen los candados de una sola línea, aquí no vale:
 * la razón de una excepción de contraste ocupa normalmente dos o tres líneas de comentario,
 * y la marca queda en la primera. Se retrocede hasta el `/*` de apertura.
 */
function escapeEn(lineas, n) {
  let texto = lineas[n - 1] ?? '';
  // retroceder por líneas en blanco hasta lo que preceda al selector
  let i = n - 2;
  while (i >= 0 && (lineas[i] ?? '').trim() === '') i--;
  if (i >= 0) {
    const fin = i;
    // Si ahí acaba un comentario de bloque, subir hasta su `/*`. Las líneas de
    // continuación de un comentario CSS no empiezan por `*`, así que no se les exige
    // formato: se retrocede hasta la apertura, con un tope para no barrer el fichero.
    if (/\*\//.test(lineas[fin] ?? '')) {
      let j = fin;
      const suelo = Math.max(0, fin - 10);
      while (j > suelo && !/\/\*/.test(lineas[j] ?? '')) j--;
      i = j;
    }
    texto += '\n' + lineas.slice(i, fin + 1).join('\n');
  }
  return clasificarEscape(texto);
}

// ─── Recorrido ─────────────────────────────────────────────────────────────────
function recorrer(dir, ext, acc = []) {
  let entradas;
  try {
    entradas = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entradas) {
    if (e.name === 'node_modules' || e.name === '.next' || e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, ext, acc);
    else if (e.name.endsWith(ext)) acc.push(p);
  }
  return acc;
}

// ─── Parser de bloques CSS ─────────────────────────────────────────────────────
/**
 * Devuelve los bloques `selector { decls }` del CSS, con la línea del selector.
 * Cuenta llaves en vez de ir línea a línea para no perder los bloques escritos en UNA
 * sola línea, que es como los escriben varias apps del catálogo.
 */
function bloquesCss(css) {
  const bloques = [];
  let i = 0;
  let buffer = '';
  let inicio = 0;
  const lineaDe = (pos) => css.slice(0, pos).split('\n').length;

  while (i < css.length) {
    if (css[i] === '/' && css[i + 1] === '*') {
      const fin = css.indexOf('*/', i + 2);
      i = fin === -1 ? css.length : fin + 2;
      continue;
    }
    if (css[i] === '{') {
      const cabecera = buffer.trim();
      if (cabecera.startsWith('@')) {
        buffer = '';
        i++;
        inicio = i;
        continue;
      }
      let prof = 1;
      let j = i + 1;
      while (j < css.length && prof > 0) {
        if (css[j] === '/' && css[j + 1] === '*') {
          const f = css.indexOf('*/', j + 2);
          j = f === -1 ? css.length : f + 2;
          continue;
        }
        if (css[j] === '{') prof++;
        else if (css[j] === '}') prof--;
        j++;
      }
      const cuerpo = css.slice(i + 1, j - 1).replace(/\/\*[\s\S]*?\*\//g, '');
      const decls = [];
      for (const trozo of cuerpo.split(';')) {
        const t = trozo.trim();
        const k = t.indexOf(':');
        if (k === -1) continue;
        decls.push({ prop: t.slice(0, k).trim().toLowerCase(), valor: t.slice(k + 1).trim() });
      }
      bloques.push({ selector: cabecera.replace(/\s+/g, ' '), decls, linea: lineaDe(i) });
      i = j;
      buffer = '';
      inicio = i;
      continue;
    }
    if (css[i] === '}') {
      buffer = '';
      i++;
      inicio = i;
      continue;
    }
    buffer += css[i];
    i++;
  }
  return bloques;
}

/** ¿El selector apunta a una cabecera de tabla? Incluye la CLASE `.th`, que 3 apps usan. */
function tocaCabecera(sel) {
  return sel.split(',').some((s) => {
    const t = s.trim();
    if (/\bthead\b/.test(t)) return true;
    if (/(^|[\s>+~(])th([\s>+~,:.[]|$)/.test(t)) return true;
    if (/\.th(\b|$)/.test(t)) return true;
    return false;
  });
}

const sinTema = (s) => s.replace(/\[data-theme[^\]]*\]\s*/g, '').replace(/\s+/g, ' ').trim();
/** Primera clase del selector: identifica la tabla a la que pertenece la regla. */
const raizDe = (s) => (sinTema(s).match(/^\.([A-Za-z0-9_-]+)/) || [, null])[1];

function fondoDe(decls) {
  for (const d of decls) {
    if (!/^background(-color|-image)?$/.test(d.prop)) continue;
    const m = d.valor.match(RE_MARCA_FONDO);
    if (m) return { token: m[1], valor: d.valor, tenido: /color-mix/i.test(d.valor) };
  }
  return null;
}
function colorDe(decls) {
  for (const d of decls) if (d.prop === 'color') return d.valor.trim();
  return null;
}

// ─── A. Hojas de estilo ────────────────────────────────────────────────────────
const errores = [];
const exentas = [];
let cssRevisados = 0;
let cabecerasVistas = 0;

for (const ruta of recorrer(path.join(RAIZ, 'app'), '.module.css')) {
  const css = fs.readFileSync(ruta, 'utf8');
  const lineas = css.split('\n');
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
  cssRevisados++;
  const bloques = bloquesCss(css);

  // Raíces de tabla cuya cabecera lleva texto blanco en ALGÚN bloque del fichero.
  // Cubre el patrón `.tabla thead tr { background }` + `.tabla th { color: white }`.
  const raicesBlancas = new Set();
  for (const b of bloques) {
    const c = colorDe(b.decls);
    if (!c || !RE_BLANCO.test(c)) continue;
    for (const s of b.selector.split(',')) {
      if (!tocaCabecera(s)) continue;
      const r = raizDe(s);
      if (r) raicesBlancas.add(r);
    }
  }

  for (const b of bloques) {
    if (!tocaCabecera(b.selector)) continue;
    const fondo = fondoDe(b.decls);
    if (!fondo) continue;
    cabecerasVistas++;

    const propio = colorDe(b.decls);
    const blancoPropio = propio ? RE_BLANCO.test(propio) : false;
    const r = raizDe(b.selector);
    const blancoHermano = !propio && r && raicesBlancas.has(r);
    if (!blancoPropio && !blancoHermano) continue;

    const esc = escapeEn(lineas, b.linea);
    if (esc === 'firmado') {
      exentas.push(`${rel}:${b.linea}`);
      continue;
    }
    const porQue = esc === 'sin razón'
      ? ' — lleva `contraste-ok:` SIN razón escrita, y una excepción sin motivo no se puede revisar'
      : '';
    const de = blancoHermano ? ' (el texto blanco lo pone una regla hermana de la misma tabla)' : '';
    const tenido = fondo.tenido ? ' dentro de un `color-mix`' : '';
    errores.push(
      `${rel}:${b.linea} — \`${b.selector}\` pone texto blanco sobre \`var(--${fondo.token})\`${tenido}${de}: ` +
      `4,11:1 en claro y 2,79:1 en oscuro, cuando un \`<th>\` exige 4,5:1. ` +
      `Usa \`var(${SUSTITUTO[fondo.token]})\`, que vale 5,47:1 en ambos temas.${porQue}`
    );
  }
}

// ─── B. Estilo en línea en el JSX (la forma del caso de origen) ────────────────
let tsxRevisados = 0;
for (const ruta of recorrer(path.join(RAIZ, 'app'), '.tsx')) {
  const txt = fs.readFileSync(ruta, 'utf8');
  if (!txt.includes('style={{')) continue;
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
  const lineas = txt.split('\n');
  tsxRevisados++;

  for (let n = 0; n < lineas.length; n++) {
    const linea = lineas[n];
    for (const m of linea.matchAll(/style=\{\{([^}]*)\}\}/g)) {
      const cuerpo = m[1];
      const mf = cuerpo.match(/background(?:Color|Image)?\s*:\s*['"`][^'"`]*var\(\s*--(primary|secondary)\s*\)/);
      if (!mf) continue;
      const mc = cuerpo.match(/(?:^|[,{\s])color\s*:\s*['"`]\s*(#fff|#ffffff|white)\s*['"`]/i);
      if (!mc) continue;
      cabecerasVistas++;

      const esc = escapeEn(lineas, n + 1);
      if (esc === 'firmado') {
        exentas.push(`${rel}:${n + 1}`);
        continue;
      }
      const porQue = esc === 'sin razón'
        ? ' — lleva `contraste-ok:` SIN razón escrita, y una excepción sin motivo no se puede revisar'
        : '';
      errores.push(
        `${rel}:${n + 1} — estilo en línea con texto blanco sobre \`var(--${mf[1]})\`: ` +
        `4,11:1 en claro y 2,79:1 en oscuro, cuando un \`<th>\` exige 4,5:1. ` +
        `Usa \`var(${SUSTITUTO[mf[1]]})\`, que vale 5,47:1 en ambos temas. ` +
        `Es la forma exacta del hallazgo 1175.${porQue}`
      );
    }
  }
}

// ─── Resultado ─────────────────────────────────────────────────────────────────
if (errores.length) {
  const muestra = VERBOSO ? errores : errores.slice(0, 12);
  console.error(`\n❌ Contraste de cabeceras: ${errores.length} problema(s)\n`);
  for (const e of muestra) console.error(`   · ${e}`);
  if (!VERBOSO && errores.length > 12) {
    console.error(`\n   … y ${errores.length - 12} más (--todo para verlos).`);
  }
  console.error('');
  process.exit(1);
}

console.log('✅ Contraste de cabeceras correcto');
console.log(`   · ${cssRevisados} hojas .module.css y ${tsxRevisados} .tsx revisados, sin pasivo`);
console.log(`   · ninguna cabecera de tabla pone texto blanco sobre var(--primary)/var(--secondary)`);
if (exentas.length) {
  console.log(`   · ${exentas.length} exenta(s) con \`contraste-ok\`: ${exentas.slice(0, 5).join(', ')}`);
}
