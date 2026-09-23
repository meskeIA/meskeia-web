#!/usr/bin/env node
/**
 * check-celdas-braille.mjs — que ninguna celda braille se dibuje en blanco
 *
 * Ejecutar:  npm run check:braille            (lo ejecuta también `npm run build`)
 *            npm run check:braille -- --lista  (imprime las celdas y sus puntos)
 *
 * QUÉ EXIGE
 * ─────────
 * Dos cosas sobre `app/conversor-braille/page.tsx`, y las dos son aritmética, no criterio:
 *
 *   A · COBERTURA — que toda celda que la app pueda EMITIR tenga entrada en `brailleDots`.
 *       Las celdas emitibles salen de tres sitios: los valores de `textToBraille`, los de
 *       `SIGNOS_COMPUESTOS` (descompuestos, porque son de dos celdas) y las constantes de los
 *       indicadores (`NUMBER_INDICATOR`, `CAPITAL_INDICATOR`, `LATIN_PREFIX`).
 *
 *   B · COHERENCIA — que los puntos declarados de cada celda sean los que dice su código
 *       Unicode. El bloque U+2800 codifica los puntos en bits: U+2800 + bit 0 = punto 1,
 *       bit 1 = punto 2, y así hasta el punto 8. `⠙` es U+2819 = 0b00011001, o sea bits 0, 3
 *       y 4, o sea puntos 1-4-5 — que es lo que `brailleDots` tiene que declarar. Esto no
 *       comprueba que la celda esté: comprueba que su patrón no esté mal TECLEADO.
 *
 * DE DÓNDE SALE
 * ─────────────
 * Del Inspector, del mismo defecto DOS veces, con el argumento ya escrito en el código:
 *
 *   · 21/08/2026 — faltaban en `brailleDots` los indicadores numeral (⠼), de mayúscula (⠨) y
 *     de latina minúscula (⠐). La reparación dejó escrito por qué importaba, literalmente:
 *     «faltaban, y `brailleDots[c] ?? []` devolvía una celda sin ningún punto: en la hoja a
 *     escala real eso es un espacio, no un indicador».
 *   · 22/09/2026 (hallazgo 1183) — faltaba ⠠ (U+2820, punto 6), la PRIMERA celda de la barra
 *     inclinada del B 2 § 6.2, que llega por `SIGNOS_COMPUESTOS` y por eso se quedó fuera de
 *     aquella reparación. En la hoja imprimible, el lector táctil encontraba una celda en
 *     blanco —separación de palabra— seguida de un punto 2 —coma—, así que «12/05/2026» se
 *     punzaba «12 ,05 ,2026». Afecta a toda fecha, fracción o URL, y duele en el único
 *     producto FÍSICO del catálogo: una hoja punzada no se puede desmentir después.
 *
 * Un mes entre las dos, la segunda con la lección de la primera delante. Eso es lo que un
 * candado hace y un comentario no: `brailleDots[c] ?? []` es una ausencia SILENCIOSA —cae al
 * array vacío y dibuja seis puntos apagados—, y el spec anterior fijaba la CADENA de celdas y
 * nunca sus PUNTOS, que es justo donde fallaba.
 *
 * POR QUÉ NO BASTABA CON EL CUADRE
 * ────────────────────────────────
 * El Cuadre compara conjuntos antes/después, así que vería DESAPARECER una entrada de
 * `brailleDots`. Las dos veces la entrada no desapareció: nunca existió, porque la celda se
 * dio de alta en otra tabla. «Nacer no es una sorpresa», y ahí el Cuadre es ciego por diseño.
 *
 * SIN PASIVO
 * ──────────
 * Las 50 entradas actuales cumplen las dos reglas (medido el 23/09/2026 al crear el candado),
 * así que solo puede encenderlo código nuevo. Igual que `check:og-image` y `check:minimo-irpf`.
 *
 * LO QUE NO MIRA
 * ──────────────
 *   · `brailleToText`, la tabla inversa. Su defecto no es silencioso del mismo modo: lo que no
 *     reconoce lo copia tal cual y la app lo avisa desde el 21/08/2026 (y desde el hallazgo
 *     1187, también cuando la entrada no trae ninguna celda braille).
 *   · Si una celda es la CORRECTA para su carácter en tinta. Eso lo dice el Documento Técnico
 *     B 2 de la Comisión Braille Española, no la aritmética, así que es trabajo del Inspector
 *     contra la fuente. Aquí solo se comprueba que lo que la app emite se pueda dibujar y que
 *     los puntos de cada celda sean los de su propio código.
 *
 * ⚠️ PARSEA UN .tsx CON REGEX, con las dos defensas que `scripts/CLAUDE.md` exige:
 *   1. Retira las líneas de comentario antes de buscar, porque este fichero CITA celdas braille
 *      en sus comentarios (⠼, ⠨, ⠐, ⠄ aparecen en la prosa que explica las reparaciones). Sin
 *      esto, el parser recogería celdas que la app no emite.
 *   2. Cuenta lo que extrae y SE PLANTA si sale absurdo. Un parser que devuelve 0 celdas donde
 *      hay 50 no está «conforme», está roto, y un candado que da verde por no haber mirado es
 *      peor que no tenerlo (§TypeScript del CLAUDE.md, el validador ciego del 14/08/2026).
 *
 * Escape: no lo tiene a propósito. Una celda emitible sin puntos no tiene falso positivo
 * posible —o se dibuja o sale en blanco— y un patrón que no cuadra con su Unicode es un error
 * de tecleo, no una decisión.
 */

import { readFileSync } from 'node:fs';

const FICHERO = process.argv.find((a) => a.endsWith('.tsx')) ?? 'app/conversor-braille/page.tsx';
const LISTA = process.argv.includes('--lista');

/** Mínimos de cordura: por debajo, el parser no ha entendido el fichero (no «está limpio»). */
const MINIMO_CELDAS_EMITIBLES = 40;
const MINIMO_ENTRADAS_DOTS = 40;

/** El bloque braille de Unicode codifica los puntos en bits desde U+2800. */
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

const esCeldaBraille = (c) => {
  const cp = c.codePointAt(0);
  return cp >= BASE_BRAILLE && cp <= 0x28ff;
};

/**
 * Quita las líneas de comentario, que en este fichero citan celdas braille a propósito.
 *
 * Se filtra por LÍNEA y no con un regex sobre todo el texto: `[\s\S]*?` no se detiene donde uno
 * cree —lo aprendió `detectar-candidatas-latam.mjs` comiéndose 607 líneas de código— y aquí no
 * hace falta, porque los comentarios de este fichero empiezan su línea.
 */
function sinComentarios(texto) {
  return texto
    .split('\n')
    .filter((linea) => !/^\s*(\/\/|\/\*|\*)/.test(linea))
    .join('\n');
}

/**
 * El cuerpo de un objeto literal `const NOMBRE... = { … };`, ya sin comentarios.
 *
 * ⚠️ El `\b` tras el nombre no es adorno: sin él, `const brailleDots[^{]*\{` encajaba también con
 * `const brailleDotsLoQueSea`, de modo que el parser podía leer un objeto que NO es el que
 * gobierna el dibujo y dar verde con él. Lo destapó la trampa 5 de `braille:probar-candado`, que
 * renombra la tabla y exige que el candado se plante: daba verde.
 */
function cuerpoDeObjeto(src, nombre) {
  const m = src.match(new RegExp(`const ${nombre}\\b[^{]*\\{([\\s\\S]*?)\\n\\};`));
  return m ? sinComentarios(m[1]) : null;
}

const src = readFileSync(FICHERO, 'utf8');
const problemas = [];

// ── Las celdas que la app puede EMITIR ────────────────────────────────────────
const emitibles = new Map(); // celda → de dónde sale

const cuerpoTexto = cuerpoDeObjeto(src, 'textToBraille');
if (cuerpoTexto === null) {
  console.error(`\n✗ braille: no se encuentra \`textToBraille\` en ${FICHERO}.`);
  console.error('  El parser no ha entendido el fichero: revísalo antes de creer este candado.\n');
  process.exit(1);
}
for (const [, celdas] of cuerpoTexto.matchAll(/:\s*'([⠀-⣿]+)'/g)) {
  for (const celda of celdas) emitibles.set(celda, 'textToBraille');
}

const cuerpoCompuestos = cuerpoDeObjeto(src, 'SIGNOS_COMPUESTOS');
if (cuerpoCompuestos === null) {
  console.error(`\n✗ braille: no se encuentra \`SIGNOS_COMPUESTOS\` en ${FICHERO}.`);
  console.error('  Es la tabla de la que salió el hallazgo 1183: sin ella el candado no vale.\n');
  process.exit(1);
}
for (const [, celdas] of cuerpoCompuestos.matchAll(/:\s*'([⠀-⣿]+)'/g)) {
  // De dos celdas, y la primera es la que el 1183 dejó sin dibujar.
  for (const celda of celdas) emitibles.set(celda, 'SIGNOS_COMPUESTOS');
}

// Los indicadores, que son constantes sueltas y fueron el caso del 21/08/2026.
for (const [, nombre, celda] of sinComentarios(src).matchAll(
  /const (\w*(?:INDICATOR|PREFIX))\s*=\s*'([⠀-⣿])'/g,
)) {
  emitibles.set(celda, nombre);
}

// ── Las celdas que la app sabe DIBUJAR ────────────────────────────────────────
const cuerpoDots = cuerpoDeObjeto(src, 'brailleDots');
if (cuerpoDots === null) {
  console.error(`\n✗ braille: no se encuentra \`brailleDots\` en ${FICHERO}.`);
  console.error('  Sin la tabla de puntos no hay nada que comprobar, y callar sería mentir.\n');
  process.exit(1);
}

const dibujables = new Map(); // celda → puntos declarados
for (const [, celda, puntos] of cuerpoDots.matchAll(/'([⠀-⣿])':\s*\[([0-9,\s]*)\]/g)) {
  dibujables.set(
    celda,
    puntos
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .map(Number),
  );
}

// ── Cordura del parser ANTES de dar cualquier veredicto ───────────────────────
if (emitibles.size < MINIMO_CELDAS_EMITIBLES || dibujables.size < MINIMO_ENTRADAS_DOTS) {
  console.error(
    `\n✗ braille: el parser ha leído ${emitibles.size} celdas emitibles y ${dibujables.size} ` +
      `entradas de puntos, por debajo de los mínimos (${MINIMO_CELDAS_EMITIBLES} y ` +
      `${MINIMO_ENTRADAS_DOTS}).`,
  );
  console.error(
    '  Eso no es un fichero conforme, es un parser que no ha entendido el formato: si las\n' +
      '  tablas han cambiado de forma, hay que actualizar este candado (scripts/CLAUDE.md).\n',
  );
  process.exit(1);
}

// ── Regla A · cobertura ───────────────────────────────────────────────────────
for (const [celda, origen] of emitibles) {
  if (!esCeldaBraille(celda)) continue;
  if (!dibujables.has(celda)) {
    const u = celda.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    problemas.push(
      `celda emitible sin puntos: «${celda}» (U+${u}, puntos ${puntosSegunUnicode(celda).join('-') || 'ninguno'}) ` +
        `sale de ${origen} y no está en brailleDots → se dibujaría en blanco, y en la hoja ` +
        `impresa eso es un ESPACIO`,
    );
  }
}

// ── Regla B · coherencia con Unicode ──────────────────────────────────────────
for (const [celda, declarados] of dibujables) {
  const esperados = puntosSegunUnicode(celda);
  if (declarados.join('-') !== esperados.join('-')) {
    const u = celda.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    problemas.push(
      `puntos que no cuadran con su código: «${celda}» (U+${u}) declara ` +
        `[${declarados.join('-') || 'vacío'}] y Unicode dice [${esperados.join('-') || 'vacío'}]`,
    );
  }
}

if (LISTA) {
  console.log(`\nbraille · ${dibujables.size} celdas dibujables, ${emitibles.size} emitibles\n`);
  for (const [celda, puntos] of dibujables) {
    const u = celda.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    const origen = emitibles.get(celda) ?? '(solo dibujable)';
    console.log(`  ${celda}  U+${u}  ${(puntos.join('-') || '—').padEnd(9)} ${origen}`);
  }
  console.log();
}

if (problemas.length > 0) {
  console.error(`\n✗ braille: ${problemas.length} problema(s) en ${FICHERO}\n`);
  for (const p of problemas) console.error(`  · ${p}`);
  console.error(
    '\n  `brailleDots[c] ?? []` no da error: devuelve una celda con los seis puntos apagados,\n' +
      '  que en la hoja a escala real es una separación de palabra. Añade la celda con sus\n' +
      '  puntos, que salen de su código Unicode (U+2800 + bits).\n',
  );
  process.exit(1);
}

console.log(
  `✓ braille: las ${emitibles.size} celdas emitibles se pueden dibujar, y los puntos de las ` +
    `${dibujables.size} entradas cuadran con su código Unicode`,
);
