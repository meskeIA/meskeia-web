#!/usr/bin/env node
/**
 * Auditoría de TRAZABILIDAD de las fuentes de `data/fiscal/`
 *
 * Ejecutar:  npm run audit:fiscal-fuentes
 *
 * QUÉ COMPRUEBA
 * ─────────────
 * Que cada identificador `BOE-A-XXXX-XXXXX` citado en `data/fiscal/` abra de verdad la norma
 * que el módulo dice estar citando. Descarga la ficha del BOE y muestra el título real junto
 * al contexto de la cita, para compararlos a ojo.
 *
 * POR QUÉ NO ES UN CANDADO DEL BUILD
 * ──────────────────────────────────
 * Depende de la red. Un candado que rompe el build porque el BOE tarda en responder se acaba
 * desactivando, y entonces no protege de nada. Este script se ejecuta en el triaje mensual
 * (`/triaje-fiscal`) y en el barrido de trazabilidad; la §1.0 del manifiesto lo referencia.
 *
 * DE DÓNDE SALE (2026-08-13)
 * ──────────────────────────
 * `iprem.ts` citaba «Ley 31/2022 de PGE 2023» con la referencia BOE-A-2022-22685, que es el
 * RDL 20/2022 — otra norma. Las cifras del IPREM eran correctas (DA 90.ª de la Ley 31/2022,
 * BOE-A-2022-22128), así que nada delataba el error: el dato era bueno, la cita parecía formal
 * y el módulo se había sellado el día anterior. Solo se cazó abriendo el identificador.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DIR_FISCAL = 'data/fiscal';

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const gris = (s) => `\x1b[90m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;

// ─── Recoger las citas ─────────────────────────────────────────────────────────

const ficheros = readdirSync(DIR_FISCAL).filter((f) => f.endsWith('.ts') || f.endsWith('.md'));
const citas = new Map(); // identificador → [{ fichero, linea, contexto }]

for (const fichero of ficheros) {
  const lineas = readFileSync(path.join(DIR_FISCAL, fichero), 'utf8').split('\n');
  lineas.forEach((linea, i) => {
    for (const m of linea.matchAll(/BOE-A-\d{4}-\d+/g)) {
      if (!citas.has(m[0])) citas.set(m[0], []);
      citas.get(m[0]).push({
        fichero,
        linea: i + 1,
        contexto: linea.trim().slice(0, 160),
      });
    }
  });
}

if (citas.size === 0) {
  console.error(rojo('✗ [fuentes] Ningún identificador BOE-A- en data/fiscal/.'));
  console.error(gris('    Con la §1.0 del manifiesto en vigor, eso es una anomalía: revisa la ruta.'));
  process.exit(1);
}

console.log(gris(`Consultando el BOE para ${citas.size} identificador(es) citado(s) en ${DIR_FISCAL}/…\n`));

// ─── Preguntar al BOE qué es cada uno ──────────────────────────────────────────

let sinRespuesta = 0;

for (const [id, usos] of [...citas].sort()) {
  let titulo;
  try {
    const r = await fetch(`https://www.boe.es/diario_boe/txt.php?id=${id}`, {
      headers: { 'User-Agent': 'meskeIA/auditoria-fuentes-fiscales' },
    });
    const html = await r.text();
    const m = html.match(/<title>([^<]+)<\/title>/i);
    titulo = m ? m[1].replace(/\s+/g, ' ').replace(id, '').trim() : null;
    if (!titulo) sinRespuesta++;
  } catch (e) {
    titulo = null;
    sinRespuesta++;
    console.log(amarillo(`${id} — no se pudo consultar (${e.message})`));
    continue;
  }

  console.log(`${verde(id)} → ${titulo ?? amarillo('(sin título en la respuesta)')}`);
  for (const uso of usos) {
    console.log(gris(`    ${uso.fichero}:${uso.linea}  ${uso.contexto}`));
  }
  console.log();
}

// ─── Cierre ────────────────────────────────────────────────────────────────────

console.log(
  gris(
    'Compara el título real con lo que dice cada cita. Un identificador que abre otra norma es el\n' +
      'fallo que busca esta auditoría, y no lo delata ni el dato (puede ser correcto) ni el sello\n' +
      '(puede ser de ayer). La comparación es humana a propósito: "Ley 31/2022" y "RDL 20/2022" solo\n' +
      'se distinguen leyendo.\n',
  ),
);

if (sinRespuesta > 0) {
  console.log(amarillo(`⚠ ${sinRespuesta} identificador(es) sin respuesta del BOE: repite la consulta antes de darlos por buenos.`));
  process.exit(1);
}

console.log(verde(`✓ [fuentes] ${citas.size} identificador(es) consultado(s) en el BOE.`));
