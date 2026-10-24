#!/usr/bin/env node
/**
 * check-celdas-braille.mjs — que ninguna celda braille se dibuje en blanco
 *
 * Ejecutar:  npm run check:braille            (lo ejecuta también `npm run build`)
 *            npm run check:braille -- --lista  (imprime las celdas emitibles y sus puntos)
 *            node scripts/check-celdas-braille.mjs <page.tsx> [--celdas <celdas.ts>]  (trampas)
 *
 * QUÉ EXIGE
 * ─────────
 * Sobre `app/conversor-braille/page.tsx` y `app/conversor-braille/celdas.ts`, y todo es
 * aritmética, no criterio:
 *
 *   A · DIBUJO DESDE EL CÓDIGO — que la vista de celdas y la hoja a escala real saquen los puntos
 *       de `puntosDeCelda` (los bits del código Unicode), y que en page.tsx no haya ninguna
 *       búsqueda en tabla que caiga a vacío (`tabla[c] ?? []`, `tabla[c] || []`). Esa caída es
 *       la ausencia SILENCIOSA de los tres casos de abajo: no da error, dibuja seis puntos apagados.
 *
 *   B · COBERTURA — que toda celda que la app pueda EMITIR salga con puntos (salvo ⠀, el espacio).
 *       Las emitibles salen de los valores de `textToBraille`, de `SIGNOS_COMPUESTOS`
 *       (descompuestos, porque son de dos celdas) y de las constantes de los indicadores.
 *
 *   C · COHERENCIA — que `puntosDeCelda` dé, para las 256 celdas U+2800-U+28FF, los puntos de su
 *       código (U+2800 + bit 0 = punto 1 … bit 7 = punto 8), y [] para lo que no es braille.
 *
 * B y C EJECUTAN `celdas.ts` (Node 24 carga .ts); si este Node no sabe, se omiten avisando, como
 * `check:consumidores`, y A sigue valiendo: lo cubre el build local que hace /push.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del Inspector, del mismo defecto TRES veces:
 *
 *   · 21/08/2026 — faltaban en la tabla `brailleDots` los indicadores numeral (⠼), de mayúscula
 *     (⠨) y de latina minúscula (⠐): «`brailleDots[c] ?? []` devolvía una celda sin ningún punto:
 *     en la hoja a escala real eso es un espacio, no un indicador».
 *   · 22/09/2026 (hallazgo 1183) — faltaba ⠠, la PRIMERA celda de la barra inclinada del
 *     B 2 § 6.2, que llega por `SIGNOS_COMPUESTOS`: «12/05/2026» se punzaba «12 ,05 ,2026».
 *     Entonces nació este candado, que exigía una entrada en la tabla por cada celda emitible.
 *   · 24/10/2026 (hallazgo 3456) — EL CANDADO FALLÓ. Desde el 3434 (23/10) una celda braille
 *     pegada pasa tal cual al resultado, y en «Braille → Texto» la hoja punza la ENTRADA: puede
 *     llegar cualquiera de las 256. El candado solo contaba como emitibles las de las tablas de la
 *     app, y 14 de las 64 celdas de seis puntos se dibujaban en blanco. Una lista de celdas
 *     emitibles nunca iba a estar completa; la reparación quitó la tabla y dibuja desde los bits,
 *     y desde entonces este candado vigila eso (regla A) en vez de la tabla.
 *
 * SIN PASIVO · SIN ESCAPE, a propósito: una celda dibujada en blanco no tiene falso positivo.
 *
 * LO QUE NO MIRA
 * ──────────────
 *   · Los puntos 7 y 8 de las celdas de ocho puntos: la vista y la hoja son de seis.
 *   · Si una celda es la CORRECTA para su carácter en tinta: eso lo dice el Documento Técnico B 2
 *     de la Comisión Braille Española, y es trabajo del Inspector contra la fuente.
 *
 * ⚠️ PARSEA UN .tsx CON REGEX, con las dos defensas que `scripts/CLAUDE.md` exige: retira las
 * líneas de comentario antes de buscar (el fichero CITA celdas y `brailleDots[c] ?? []` en su
 * prosa) y SE PLANTA si lo que extrae sale absurdo, en vez de dar verde por no haber mirado.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const FICHERO = process.argv.find((a) => a.endsWith('.tsx')) ?? 'app/conversor-braille/page.tsx';
const iCeldas = process.argv.indexOf('--celdas');
const CELDAS = iCeldas >= 0 ? process.argv[iCeldas + 1] : 'app/conversor-braille/celdas.ts';
const LISTA = process.argv.includes('--lista');

/** Mínimo de cordura: por debajo, el parser no ha entendido el fichero (no «está limpio»). */
const MINIMO_CELDAS_EMITIBLES = 40;
/** La vista de celdas y la hoja: dos sitios que dibujan. */
const MINIMO_LLAMADAS_DIBUJO = 2;

const BASE_BRAILLE = 0x2800;

/** Los puntos que corresponden a una celda según su código Unicode. */
function puntosSegunUnicode(celda) {
  const desplazamiento = celda.codePointAt(0) - BASE_BRAILLE;
  const puntos = [];
  for (let bit = 0; bit < 8; bit++) {
    if (desplazamiento & (1 << bit)) puntos.push(bit + 1);
  }
  return puntos;
}

const unicode = (celda) => `U+${celda.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

/** Quita las líneas de comentario (por LÍNEA: `[\s\S]*?` no se detiene donde uno cree). */
function sinComentarios(texto) {
  return texto
    .split('\n')
    .filter((linea) => !/^\s*(\/\/|\/\*|\*)/.test(linea))
    .join('\n');
}

/** El cuerpo de un objeto literal `const NOMBRE... = { … };`, ya sin comentarios. */
function cuerpoDeObjeto(src, nombre) {
  const m = src.match(new RegExp(`const ${nombre}\\b[^{]*\\{([\\s\\S]*?)\\n\\};`));
  return m ? sinComentarios(m[1]) : null;
}

function plantarse(mensaje) {
  console.error(`\n✗ braille: ${mensaje}`);
  console.error('  El parser no ha entendido el fichero: revísalo antes de creer este candado.\n');
  process.exit(1);
}

const src = readFileSync(FICHERO, 'utf8');
const codigo = sinComentarios(src);
const problemas = [];

// ── Las celdas que la app puede EMITIR ────────────────────────────────────────
const emitibles = new Map(); // celda → de dónde sale

const cuerpoTexto = cuerpoDeObjeto(src, 'textToBraille');
if (cuerpoTexto === null) plantarse(`no se encuentra \`textToBraille\` en ${FICHERO}.`);
for (const [, celdas] of cuerpoTexto.matchAll(/:\s*'([⠀-⣿]+)'/g)) {
  for (const celda of celdas) emitibles.set(celda, 'textToBraille');
}

const cuerpoCompuestos = cuerpoDeObjeto(src, 'SIGNOS_COMPUESTOS');
if (cuerpoCompuestos === null) plantarse(`no se encuentra \`SIGNOS_COMPUESTOS\` en ${FICHERO} (la tabla del hallazgo 1183).`);
for (const [, celdas] of cuerpoCompuestos.matchAll(/:\s*'([⠀-⣿]+)'/g)) {
  for (const celda of celdas) emitibles.set(celda, 'SIGNOS_COMPUESTOS');
}

for (const [, nombre, celda] of codigo.matchAll(/const (\w*(?:INDICATOR|PREFIX))\s*=\s*'([⠀-⣿])'/g)) {
  emitibles.set(celda, nombre);
}

if (emitibles.size < MINIMO_CELDAS_EMITIBLES) {
  plantarse(`el parser ha leído ${emitibles.size} celdas emitibles, por debajo del mínimo (${MINIMO_CELDAS_EMITIBLES}).`);
}

// ── Regla A · el dibujo sale del código, no de una tabla ──────────────────────
// Primero la búsqueda en tabla: si la hay, ESE es el defecto, y plantarse por faltar una llamada
// a puntosDeCelda escondería el motivo (lo destapó la trampa 1).
for (const [busqueda] of codigo.matchAll(/\b\w+\s*\[\s*\w+\s*\]\s*(?:\?\?|\|\|)\s*\[\s*\]/g)) {
  problemas.push(
    `búsqueda en tabla que cae a vacío: «${busqueda}» → una celda que no esté en la tabla se ` +
      'dibuja sin ningún punto, y en la hoja a escala real eso es un ESPACIO (hallazgo 3456). ' +
      'Los puntos salen de `puntosDeCelda`',
  );
}
const llamadas = [...codigo.matchAll(/\bpuntosDeCelda\s*\(/g)].length;
if (llamadas < MINIMO_LLAMADAS_DIBUJO && problemas.length === 0) {
  plantarse(
    `no se encuentra el dibujo con \`puntosDeCelda\` en ${FICHERO}: ${llamadas} llamada(s), y la ` +
      `vista de celdas y la hoja son ${MINIMO_LLAMADAS_DIBUJO}. Si el dibujo cambió de forma, hay que ` +
      'actualizar este candado (scripts/CLAUDE.md).',
  );
}
if (!/import\s*\{[^}]*\bpuntosDeCelda\b[^}]*\}\s*from\s*'\.\/(celdas|TecladoBraille)'/.test(codigo)) {
  plantarse(`no se encuentra el import de \`puntosDeCelda\` desde ./celdas en ${FICHERO}.`);
}

// ── Reglas B y C · ejecutando celdas.ts ───────────────────────────────────────
let puntosDeCelda = null;
if (!process.features?.typescript) {
  console.log(`⏭️  check:braille: Node ${process.version} no carga .ts; omito cobertura y coherencia (la regla A sí se ha mirado).`);
} else {
  try {
    ({ puntosDeCelda } = await import(pathToFileURL(resolve(CELDAS)).href));
  } catch (e) {
    plantarse(`no se puede cargar ${CELDAS}: ${e.message}`);
  }
  if (typeof puntosDeCelda !== 'function') plantarse(`no se encuentra \`puntosDeCelda\` exportada en ${CELDAS}.`);

  // B · cobertura
  for (const [celda, origen] of emitibles) {
    if (celda === '⠀') continue;
    if (puntosDeCelda(celda).length === 0) {
      problemas.push(
        `celda emitible sin puntos: «${celda}» (${unicode(celda)}, puntos ${puntosSegunUnicode(celda).join('-')}) ` +
          `sale de ${origen} y se dibujaría en blanco: en la hoja impresa eso es un ESPACIO`,
      );
    }
  }

  // C · coherencia, las 256
  for (let cp = BASE_BRAILLE; cp <= 0x28ff; cp++) {
    const celda = String.fromCodePoint(cp);
    const obtenidos = puntosDeCelda(celda).join('-');
    const esperados = puntosSegunUnicode(celda).join('-');
    if (obtenidos !== esperados) {
      problemas.push(
        `puntos que no cuadran con su código: «${celda}» (${unicode(celda)}) da ` +
          `[${obtenidos || 'vacío'}] y Unicode dice [${esperados || 'vacío'}]`,
      );
    }
  }
  for (const ajeno of ['a', 'Z', '1', ' ']) {
    if (puntosDeCelda(ajeno).length > 0) {
      problemas.push(`puntos que no cuadran con su código: «${ajeno}» no es una celda braille y da [${puntosDeCelda(ajeno).join('-')}]`);
    }
  }
}

if (LISTA) {
  console.log(`\nbraille · ${emitibles.size} celdas emitibles, ${llamadas} dibujos con puntosDeCelda\n`);
  for (const [celda, origen] of emitibles) {
    console.log(`  ${celda}  ${unicode(celda)}  ${(puntosSegunUnicode(celda).join('-') || '—').padEnd(9)} ${origen}`);
  }
  console.log();
}

if (problemas.length > 0) {
  const mostrados = problemas.slice(0, 20);
  console.error(`\n✗ braille: ${problemas.length} problema(s) en ${FICHERO}\n`);
  for (const p of mostrados) console.error(`  · ${p}`);
  if (problemas.length > mostrados.length) console.error(`  · … y ${problemas.length - mostrados.length} más`);
  console.error('\n  Una celda sin puntos no da error: se dibuja con los seis apagados, que en la hoja a\n  escala real es una separación de palabra.\n');
  process.exit(1);
}

console.log(
  `✓ braille: el dibujo sale del código Unicode (${llamadas} llamadas a puntosDeCelda), las ` +
    `${emitibles.size} celdas emitibles se pueden dibujar` +
    (puntosDeCelda ? ' y las 256 celdas cuadran con su código' : ''),
);
