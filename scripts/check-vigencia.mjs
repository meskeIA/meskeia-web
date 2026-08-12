#!/usr/bin/env node
/**
 * check-vigencia.mjs — ¿ha cambiado la ley DESPUÉS de que selláramos el dato?
 *
 * Pregunta al texto CONSOLIDADO del BOE, artículo por artículo, cuándo fue su
 * última modificación, y la compara con el sello `verificado` del bloque de
 * `data/fiscal/` que se apoya en él. Si la ley se movió después del sello, ese
 * bloque hay que abrirlo a mano.
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 * El Vigía Normativo mira el BOE hacia adelante desde que nació (06/07/2026), así
 * que nada anterior a esa fecha lo va a auditar nunca, por muchas pasadas
 * mensuales que se hagan. El 12/08/2026 salió así una `edadMinima: 60` en
 * jubilación parcial que llevaba dieciséis meses diciéndole que sí a quien no
 * cumplía: el art. 215 LGSS lo había reescrito el RDL 11/2024 con efectos de
 * abril de 2025, y el sello del bloque era de enero de 2025.
 *
 * Este script hace la pregunta al revés que el Vigía —desde el dato hacia la
 * norma, no desde el boletín hacia el dato— y por eso puede cubrir años hacia
 * atrás sin coste: la API de legislación consolidada del BOE es pública,
 * gratuita y determinista. Aquí no interviene ningún modelo.
 *
 * ── Lo que NO hace ───────────────────────────────────────────────────────────
 * No comprueba VALORES, solo FECHAS. Que un artículo no se haya tocado desde
 * 2014 significa que su régimen sigue vigente, no que la cifra del módulo sea la
 * correcta. Tampoco cubre lo que no vive en una norma consolidada: importes de
 * RD anuales (SMI, revalorizaciones), datos del INE, ni las 17 normativas
 * autonómicas — eso es trabajo del triaje mensual y de la revisión de enero.
 *
 * NO se engancha a `npm run build`, a diferencia de check:verticales o
 * check:enlaces: depende de un servicio externo, y un BOE caído no puede impedir
 * un despliegue. Se ejecuta a mano o desde la revisión periódica.
 *
 * Uso:
 *   node scripts/check-vigencia.mjs             → informe completo
 *   node scripts/check-vigencia.mjs --solo-alertas
 *   node scripts/check-vigencia.mjs --estricto  → sale con código 1 si hay alertas
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_FISCAL = join(RAIZ, 'data', 'fiscal');
const API = 'https://www.boe.es/datosabiertos/api/legislacion-consolidada/id';

/**
 * Qué artículo sostiene qué bloque de datos.
 *
 * `meta` es la constante `*_META` cuyo `verificado` manda sobre esos artículos
 * — se lee del fichero, así que al re-sellar un módulo esta tabla se actualiza
 * sola. La correspondencia módulo → normativa está documentada en la §3 del
 * MANIFIESTO-VIGILANCIA.md; aquí solo se concreta a nivel de artículo.
 */
const VIGILANCIA = [
  {
    modulo: 'irpf',
    meta: 'FISCAL_IRPF_META',
    norma: 'BOE-A-2006-20764',
    nombreNorma: 'Ley 35/2006 del IRPF',
    articulos: {
      a57: 'Mínimo del contribuyente',
      a58: 'Mínimo por descendientes',
      a59: 'Mínimo por ascendientes',
      a60: 'Mínimo por discapacidad',
      a63: 'Escala general del impuesto',
      a66: 'Escala de la base del ahorro',
    },
  },
  {
    modulo: 'pensiones',
    meta: 'FISCAL_PENSIONES_META',
    norma: 'BOE-A-2015-11724',
    nombreNorma: 'LGSS (RDL 8/2015)',
    articulos: {
      a205: 'Jubilación ordinaria: edad y cotización',
      a207: 'Jubilación anticipada por causa no imputable',
      a208: 'Jubilación anticipada por voluntad del interesado',
      a209: 'Base reguladora de la pensión',
      a210: 'Porcentaje aplicable a la base reguladora',
    },
  },
  {
    modulo: 'pensiones',
    meta: 'JUBILACION_PARCIAL_META',
    norma: 'BOE-A-2015-11724',
    nombreNorma: 'LGSS (RDL 8/2015)',
    articulos: {
      a215: 'Jubilación parcial',
      a216: 'Jubilación flexible',
    },
  },
  {
    modulo: 'pensiones',
    meta: 'COMPLEMENTO_BRECHA_GENERO_META',
    norma: 'BOE-A-2015-11724',
    nombreNorma: 'LGSS (RDL 8/2015)',
    articulos: {
      a60: 'Complemento para la reducción de la brecha de género',
    },
  },
  {
    modulo: 'iva',
    meta: 'FISCAL_IVA_META',
    norma: 'BOE-A-1992-28740',
    nombreNorma: 'Ley 37/1992 del IVA',
    articulos: {
      a90: 'Tipo impositivo general',
      a91: 'Tipos impositivos reducidos',
    },
  },
  {
    modulo: 'sociedades',
    meta: 'FISCAL_SOCIEDADES_META',
    norma: 'BOE-A-2014-12328',
    nombreNorma: 'Ley 27/2014 del Impuesto sobre Sociedades',
    articulos: {
      a29: 'Tipos de gravamen',
    },
  },
];

const args = process.argv.slice(2);
const soloAlertas = args.includes('--solo-alertas');
const estricto = args.includes('--estricto');

/** Lee el `verificado` que corresponde a una constante *_META concreta del módulo. */
function leerSello(modulo, meta) {
  const texto = readFileSync(join(DIR_FISCAL, `${modulo}.ts`), 'utf-8');
  const inicio = texto.indexOf(`export const ${meta}`);
  if (inicio === -1) return null;
  const encontrado = texto.slice(inicio).match(/verificado:\s*'([0-9]{4}-[0-9]{2}-[0-9]{2})'/);
  return encontrado ? encontrado[1] : null;
}

/** Fecha de vigencia de la ÚLTIMA versión de un artículo, en formato YYYY-MM-DD. */
async function ultimaModificacion(norma, articulo) {
  let respuesta;
  try {
    respuesta = await fetch(`${API}/${norma}/texto/bloque/${articulo}`, {
      headers: { Accept: 'application/xml' },
    });
  } catch (e) {
    return { error: `sin respuesta (${e.message})` };
  }
  if (!respuesta.ok) return { error: `HTTP ${respuesta.status}` };

  const xml = await respuesta.text();
  const fechas = [...xml.matchAll(/fecha_vigencia="(\d{8})"/g)].map((m) => m[1]);
  if (fechas.length === 0) return { error: 'sin versiones en la respuesta' };

  const ultima = fechas.sort().at(-1);
  return { fecha: `${ultima.slice(0, 4)}-${ultima.slice(4, 6)}-${ultima.slice(6, 8)}`, versiones: fechas.length };
}

console.log('\n🏛️  Vigencia de data/fiscal contra el texto consolidado del BOE');
console.log('─'.repeat(78));

let alertas = 0;
let incidencias = 0;
let comprobados = 0;

for (const entrada of VIGILANCIA) {
  const sello = leerSello(entrada.modulo, entrada.meta);
  if (!sello) {
    console.log(`\n⚠️  ${entrada.modulo} · ${entrada.meta} — no se encuentra la constante o su sello.`);
    incidencias++;
    continue;
  }

  const lineas = [];
  for (const [articulo, descripcion] of Object.entries(entrada.articulos)) {
    const r = await ultimaModificacion(entrada.norma, articulo);
    comprobados++;

    if (r.error) {
      lineas.push(`   ⚠️  art. ${articulo.slice(1).padEnd(4)} ${descripcion} — no consultable (${r.error})`);
      incidencias++;
      continue;
    }

    const posterior = r.fecha > sello;
    if (posterior) alertas++;
    const marca = posterior ? '🚨' : '✅';
    const cola = posterior ? 'MODIFICADO DESPUÉS DEL SELLO — abrir la norma' : 'sin cambios desde el sello';
    lineas.push(`   ${marca} art. ${articulo.slice(1).padEnd(4)} ${descripcion.padEnd(50)} ${r.fecha}  ${cola}`);
  }

  const hayAlerta = lineas.some((l) => l.includes('🚨'));
  if (soloAlertas && !hayAlerta) continue;

  console.log(`\n▶ ${entrada.modulo}.ts · ${entrada.meta}`);
  console.log(`   ${entrada.nombreNorma} · sellado el ${sello}`);
  for (const l of lineas) console.log(l);
}

console.log('\n' + '─'.repeat(78));
console.log(`${comprobados} artículos comprobados · ${alertas} con cambios posteriores al sello · ${incidencias} incidencias`);
if (alertas > 0) {
  console.log('\n🚨 Los marcados exigen abrir la norma y comparar los valores: este script mira');
  console.log('   FECHAS, no cifras. Un artículo modificado no siempre cambia el dato del módulo.');
} else {
  console.log('\nNingún artículo vigilado se ha movido después de su sello.');
}
console.log('Recuerda: no cubre RD anuales (SMI, revalorizaciones), datos del INE ni normativa autonómica.\n');

if (estricto && alertas > 0) process.exit(1);
