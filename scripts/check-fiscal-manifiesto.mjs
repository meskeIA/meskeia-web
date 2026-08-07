#!/usr/bin/env node
/**
 * Candado de COBERTURA del manifiesto de vigilancia fiscal
 *
 * Ejecutar:  npm run check:fiscal   (lo lanza también `npm run build`, y rompe el build si falla)
 *
 * QUÉ COMPRUEBA — y qué NO
 * ────────────────────────
 * Comprueba una sola cosa, objetiva y sin juicio: que **todo módulo de `data/fiscal/` esté
 * declarado**, o bien con ficha de vigilancia en `MANIFIESTO-VIGILANCIA.md` y su sello
 * `verificado`, o bien en la lista de exentos de la sección 3.7. Es un candado de EXISTENCIA.
 *
 * NO comprueba la ANTIGÜEDAD de los sellos, y es deliberado. Un sello viejo no significa
 * desatención: los módulos de CCAA (`inmuebles`, `sucesiones`, `donaciones`, `patrimonio`) NO se
 * re-sellan en el triaje mensual a propósito, porque su sello afirma "las 17 comunidades
 * verificadas" y eso solo lo puede garantizar la inmersión de enero. Un candado que rompiera el
 * build por antigüedad presionaría a re-sellar para desbloquear — es decir, a afirmar algo falso
 * sobre contenido YMYL para que compile. El "cuándo" de la vigilancia vive en la Agenda Operativa
 * (cadencia `fiscal-mensual` + hito `revision-anual-enero`), no aquí.
 *
 * DE DÓNDE SALE (2026-08-07)
 * ──────────────────────────
 * Al crear `ganancia-inmueble.ts` quedó, sin querer, el único módulo del directorio sin ficha y sin
 * sello. Estaba justificado —solo contiene fórmula— pero esa decisión no constaba en ninguna parte
 * que el sistema leyera: meses después nadie podría distinguir "exento por diseño" de "olvidado".
 * El propio manifiesto nombra ese riesgo: «un dato normativo sin contrato de vigilancia envejece sin
 * que nadie lo note».
 *
 * PARSEO A PRUEBA DE SILENCIOS
 * ────────────────────────────
 * La lista de exentos se delimita con los marcadores HTML `EXENTOS:INICIO` / `EXENTOS:FIN`, y si no
 * aparecen el script FALLA en vez de asumir que no hay exentos. Un parser que se queda callado
 * cuando cambia el formato del fichero que lee es un candado que no protege de nada.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIR_FISCAL = 'data/fiscal';
const MANIFIESTO = path.join(DIR_FISCAL, 'MANIFIESTO-VIGILANCIA.md');

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const gris = (s) => `\x1b[90m${s}\x1b[0m`;

const errores = [];

// ─── Entradas ──────────────────────────────────────────────────────────────────

if (!existsSync(MANIFIESTO)) {
  console.error(rojo(`✗ [fiscal] No existe ${MANIFIESTO}: sin manifiesto no hay contrato de vigilancia.`));
  process.exit(1);
}

const manifiesto = readFileSync(MANIFIESTO, 'utf8');

const modulos = readdirSync(DIR_FISCAL)
  .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  .sort();

if (modulos.length === 0) {
  console.error(rojo('✗ [fiscal] No se ha encontrado ningún módulo en data/fiscal: revisa la ruta.'));
  process.exit(1);
}

// ─── Fichas declaradas: encabezados «#### `modulo.ts` — …» ─────────────────────

const conFicha = new Set(
  [...manifiesto.matchAll(/^#{3,4}\s+`([\w-]+\.ts)`/gm)].map((m) => m[1]),
);

// ─── Exentos declarados, entre marcadores explícitos ───────────────────────────

const bloqueExentos = manifiesto.match(/<!--\s*EXENTOS:INICIO\s*-->([\s\S]*?)<!--\s*EXENTOS:FIN\s*-->/);

if (!bloqueExentos) {
  console.error(rojo('✗ [fiscal] No se encuentran los marcadores EXENTOS:INICIO / EXENTOS:FIN en el manifiesto.'));
  console.error(gris('    Sin ellos no se puede saber qué módulos están exentos, y asumir "ninguno" sería'));
  console.error(gris('    inventarse la respuesta. Restaura la sección 3.7 o corrige los marcadores.'));
  process.exit(1);
}

const exentos = new Set(
  [...bloqueExentos[1].matchAll(/^\|\s*`([\w-]+\.ts)`\s*\|/gm)].map((m) => m[1]),
);

// ─── 1. Todo módulo, declarado ─────────────────────────────────────────────────

for (const modulo of modulos) {
  const tieneFicha = conFicha.has(modulo);
  const estaExento = exentos.has(modulo);
  const tieneSello = /verificado:\s*['"]\d{4}-\d{2}-\d{2}['"]/.test(
    readFileSync(path.join(DIR_FISCAL, modulo), 'utf8'),
  );

  if (!tieneFicha && !estaExento) {
    errores.push(
      `${modulo}: no tiene ficha en el manifiesto ni figura como exento.\n` +
        gris('       Si contiene datos normativos → añade su ficha en la sección 3.\n') +
        gris('       Si solo contiene fórmula → decláralo en la sección 3.7 (Módulos EXENTOS).'),
    );
    continue;
  }

  if (tieneFicha && estaExento) {
    errores.push(`${modulo}: aparece a la vez con ficha de vigilancia y como exento. Solo puede ser una de las dos cosas.`);
    continue;
  }

  if (tieneFicha && !tieneSello) {
    errores.push(
      `${modulo}: tiene ficha de vigilancia pero ningún sello \`verificado: 'AAAA-MM-DD'\` en el código.\n` +
        gris('       Un módulo vigilado sin sello no permite saber a qué fecha responde su contenido.'),
    );
  }

  if (estaExento && tieneSello) {
    errores.push(
      `${modulo}: está declarado exento pero lleva sello \`verificado\`.\n` +
        gris('       Si tiene datos que caducan, no es exento: sácalo de 3.7 y dale su ficha.'),
    );
  }
}

// ─── 2. Punteros muertos: lo declarado que ya no existe ────────────────────────

const enDisco = new Set(modulos);

for (const declarado of conFicha) {
  if (!enDisco.has(declarado)) {
    errores.push(`${declarado}: tiene ficha en el manifiesto pero el archivo ya no existe. Retira la ficha o restaura el módulo.`);
  }
}

for (const declarado of exentos) {
  if (!enDisco.has(declarado)) {
    errores.push(`${declarado}: figura como exento pero el archivo ya no existe. Retíralo de la sección 3.7.`);
  }
}

// ─── Salida ────────────────────────────────────────────────────────────────────

if (errores.length > 0) {
  console.error(rojo(`\n✗ [fiscal] ${errores.length} problema(s) de cobertura del manifiesto de vigilancia:\n`));
  for (const e of errores) console.error(rojo(`  · ${e}`));
  console.error(
    gris(`\n  Manifiesto: ${MANIFIESTO}\n`) +
      gris('  Este candado solo comprueba que cada módulo esté DECLARADO (vigilado o exento).\n') +
      gris('  La antigüedad de los sellos no se comprueba aquí a propósito: la gobierna el ciclo\n') +
      gris('  de la Agenda Operativa (fiscal-mensual + revision-anual-enero).\n'),
  );
  process.exit(1);
}

const vigilados = modulos.length - exentos.size;
console.log(
  verde('✓ [fiscal]') +
    gris(` ${modulos.length} módulo(s) declarado(s): ${vigilados} con ficha y sello, ${exentos.size} exento(s).`),
);
