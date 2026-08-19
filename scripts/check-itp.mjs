#!/usr/bin/env node
/**
 * check-itp.mjs — que el tipo general del ITP siga teniendo UN solo sitio
 *
 * Ejecutar:  npm run check:itp   (lo lanza también `npm run build`, y rompe el build si falla)
 *
 * QUÉ COMPRUEBA — y qué NO
 * ────────────────────────
 * Una sola cosa, estructural y sin juicio: que en `data/itp-ccaa.ts` ningún `tipoGeneral`
 * vuelva a escribirse como número, en vez de leerse de `TIPOS_ITP_CCAA_2025`
 * (`data/fiscal/inmuebles.ts`). Y que las dos tablas se cubran: cada comunidad del motor
 * tiene su entrada en la ficha, y al revés.
 *
 * NO comprueba si los tipos son los VIGENTES. Eso no lo puede saber un script: es trabajo
 * del Vigía Normativo, del triaje mensual y de la inmersión de enero. Aquí solo se
 * garantiza que el dato no pueda volver a estar en dos sitios con dos valores.
 *
 * DE DÓNDE SALE (2026-08-19)
 * ──────────────────────────
 * El hallazgo 31 del Inspector decía que `data/itp-ccaa.ts` «duplica TIPOS_ITP_CCAA_2025».
 * Al medirlo, los 17 tipos GENERALES coincidían al 100 % — pero los tipos REDUCIDOS habían
 * divergido en tres comunidades sin que nada avisara, y en direcciones distintas: Murcia
 * estaba bien en el motor y mal en la ficha; La Rioja y Cataluña, al revés. Ninguna de las
 * dos tablas era «la verificada». Lo que falló no fue un dato: fue que el mismo dato tenía
 * dos dueños y ninguno de los dos podía notar que el otro se había movido.
 *
 * Los reducidos no se pueden derivar —en el motor son una lista con condiciones evaluables
 * y en la ficha un solo número con una nota en prosa—, así que la unificación llega hasta
 * donde llega y este candado protege exactamente esa parte: la que sí es derivable.
 *
 * PARSEO A PRUEBA DE SILENCIOS
 * ────────────────────────────
 * Si el regex reconoce menos entradas de las que hay, el script FALLA en vez de dar el
 * visto bueno: un candado que no encuentra nada no puede informar de que todo está bien.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const leer = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

/**
 * Ceuta y Melilla no son comunidades autónomas y `data/fiscal` no las recoge: su tipo se
 * escribe en el motor a propósito. La excepción va aquí, nombrada, para que dentro de un
 * año se pueda distinguir «decidido» de «se nos colaron dos».
 */
const EXCEPCIONES = new Set(['Ciudad Autónoma de Ceuta', 'Ciudad Autónoma de Melilla']);

/** Filas de TIPOS_ITP_CCAA_2025 que no son una comunidad. */
const NO_SON_CCAA = new Set(['Media orientativa']);

const errores = [];
const motorSrc = leer('data/itp-ccaa.ts');
const fichaSrc = leer('data/fiscal/inmuebles.ts');

// ── 1. Cada entrada de ITP_CCAA: ¿deriva su tipo general o lo escribe? ────────────
const entradas = [
  ...motorSrc.matchAll(/nombre:\s*'([^']+)',\s*(?:\/\/[^\n]*\n\s*)*tipoGeneral:\s*([^\n,]+),/g),
].map((m) => ({ nombre: m[1], expresion: m[2].trim() }));

if (entradas.length < 19) {
  errores.push(
    `el parseo solo ha reconocido ${entradas.length} entradas de ITP_CCAA y deberían ser 19. ` +
      'Revisa el regex de scripts/check-itp.mjs antes de fiarte de este candado.',
  );
}

for (const { nombre, expresion } of entradas) {
  if (expresion.match(/^tipoGeneralDe\('[^']+'\)$/)) continue;
  if (EXCEPCIONES.has(nombre)) continue;
  errores.push(
    `«${nombre}» escribe su tipo general a mano (\`${expresion}\`) en data/itp-ccaa.ts. ` +
      "Usa tipoGeneralDe('<nombre en data/fiscal>'): el valor vive en TIPOS_ITP_CCAA_2025.",
  );
}

// ── 2. Cobertura: los nombres que se le piden a la ficha tienen que existir ───────
const pedidos = [...motorSrc.matchAll(/tipoGeneralDe\('([^']+)'\)/g)].map((m) => m[1]);
const enFicha = [...fichaSrc.matchAll(/\{\s*ccaa:\s*'([^']+)'/g)].map((m) => m[1]);

if (enFicha.length < 18) {
  errores.push(
    `el parseo solo ha reconocido ${enFicha.length} filas de TIPOS_ITP_CCAA_2025 y deberían ser 18. ` +
      'Revisa el regex de scripts/check-itp.mjs.',
  );
}

for (const nombre of pedidos) {
  if (!enFicha.includes(nombre)) {
    errores.push(
      `data/itp-ccaa.ts pide el tipo general de «${nombre}» y TIPOS_ITP_CCAA_2025 no lo tiene. ` +
        'El módulo lanzaría al cargar: añádelo en data/fiscal/inmuebles.ts o corrige el nombre.',
    );
  }
}

// ── 3. Y al revés: una comunidad en la ficha que el motor no conozca ──────────────
for (const nombre of enFicha) {
  if (NO_SON_CCAA.has(nombre)) continue;
  if (!pedidos.includes(nombre)) {
    errores.push(
      `TIPOS_ITP_CCAA_2025 trae «${nombre}» y ninguna entrada de ITP_CCAA lo usa. ` +
        'O falta la comunidad en data/itp-ccaa.ts, o el nombre no coincide entre las dos tablas.',
    );
  }
}

// ── Resultado ────────────────────────────────────────────────────────────────────
if (errores.length) {
  console.error('\n✗ [itp] el tipo general del ITP ha vuelto a tener dos dueños:\n');
  errores.forEach((e) => console.error('  · ' + e));
  console.error(
    '\n  data/fiscal es la autoridad del VALOR del tipo general; data/itp-ccaa.ts, la del\n' +
      '  CÁLCULO (escalas, tipos reducidos y sus condiciones, aranceles y plusvalía).\n',
  );
  process.exit(1);
}

console.log(
  `\x1b[32m✓ [itp]\x1b[0m\x1b[90m ${entradas.length} entradas de ITP_CCAA · ` +
    `${pedidos.length} tipos generales leídos de data/fiscal · ` +
    `${EXCEPCIONES.size} excepciones declaradas (Ceuta y Melilla).\x1b[0m`,
);
