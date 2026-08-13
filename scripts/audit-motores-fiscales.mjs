#!/usr/bin/env node
/**
 * Cribado de riesgo de los motores de `lib/calculadoras/`
 *
 * Ejecutar:  npm run audit:motores
 *
 * QUÉ HACE — y qué NO
 * ───────────────────
 * Tres pasadas, de menos a más concluyente:
 *   1. RIESGO: qué motores manejan normativa, cuáles escriben sus cifras a mano en vez de
 *      importarlas de `data/fiscal/`, con qué sello y si están expuestos como tool del MCP.
 *   2. HUELLAS: busca cifras que sabemos caducadas (SMI y bases de ejercicios pasados,
 *      permiso de 16 semanas…). Lo que aparece aquí es un error, no una sospecha.
 *   3. CONTRASTE: compara las constantes de cada motor con los valores vigentes de
 *      `data/fiscal`. Un mismo concepto con dos valores distintos en el repositorio.
 *
 * NO sustituye a la auditoría normativa. Los pasos 2 y 3 solo ven datos que TAMBIÉN están en
 * `data/fiscal`; un motor puede tener mal un dato que solo vive en él (límites de dietas,
 * bonificaciones de contratación, retenciones de derechos de autor…) y salir limpio aquí.
 * Eso exige leer la norma, módulo a módulo.
 *
 * DE DÓNDE SALE (2026-08-13)
 * ──────────────────────────
 * `permisoParental.ts` calculaba con 16 semanas —derogadas el 31/07/2025— y descontaba una
 * retención de IRPF de una prestación exenta, anunciando un neto inferior al real; llevaba así
 * desde enero de 2025. `excedenteCotizacionSS.ts` usaba la base máxima de 2025, con lo que el
 * umbral de devolución por pluriactividad salía 1.222 € bajo, y podía negar una devolución
 * procedente. Los dos hardcodeaban lo que `data/fiscal` ya tenía bien.
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DIR = 'lib/calculadoras';

const rojo = (s) => `\x1b[31m${s}\x1b[0m`;
const verde = (s) => `\x1b[32m${s}\x1b[0m`;
const gris = (s) => `\x1b[90m${s}\x1b[0m`;
const amarillo = (s) => `\x1b[33m${s}\x1b[0m`;

// Valores vigentes, tomados de data/fiscal (verificados contra el BOE)
const VIGENTES = [
  { magnitud: 'SMI mensual',          valor: 1221,    nombres: /SMI.*(MES|MENSUAL)|SALARIO_MINIMO(?!.*ANUAL)/i, obsoletos: [1184, 1134, 1080] },
  { magnitud: 'SMI anual (14 pagas)', valor: 17094,   nombres: /SMI.*ANUAL|SALARIO_MINIMO_ANUAL/i,              obsoletos: [16576, 15876, 15120] },
  { magnitud: 'IPREM mensual',        valor: 600,     nombres: /IPREM.*(MES|MENSUAL)/i,                          obsoletos: [579.02, 564.9] },
  { magnitud: 'IPREM anual 14 pagas', valor: 8400,    nombres: /IPREM.*14/i,                                     obsoletos: [8106.28] },
  { magnitud: 'Base máx. cotización', valor: 5101.20, nombres: /BASE_MAX.*(COTIZ|SS|MENSUAL|ANUAL)/i,            obsoletos: [4909.5, 4720.5, 4495.5] },
  { magnitud: 'Base mín. cotización', valor: 1424.40, nombres: /BASE_MIN.*(COTIZ|SS|MENSUAL)/i,                  obsoletos: [1381.2, 1323, 1260] },
  { magnitud: 'Tipo RETA total',      valor: 31.50,   nombres: /TIPO.*RETA|RETA.*TIPO/i,                         obsoletos: [31.4, 31.3, 30.6] },
];

const CADUCADAS = [
  { pat: /\b1184(?:[.,]0+)?\b|1\.184(?:,\d+)?/g, que: 'SMI 2025 (1.184 €/mes)',        hoy: '1.221 €/mes (RD 126/2026)' },
  { pat: /\b1134(?:[.,]0+)?\b/g,                 que: 'SMI 2024 (1.134 €/mes)',        hoy: '1.221 €/mes' },
  { pat: /4909[.,]50|4\.909,50/g,                que: 'Base máxima 2025 (4.909,50 €)', hoy: '5.101,20 € (Orden PJC/297/2026)' },
  { pat: /1381[.,]20|1\.381,20/g,                que: 'Base mínima 2025 (1.381,20 €)', hoy: '1.424,40 €' },
  { pat: /\b31[.,]40\b/g,                        que: 'Tipo RETA 31,40%',              hoy: '31,50% (Orden PJC/297/2026)' },
  { pat: /\b16\s*semanas\b/gi,                   que: 'Permiso de 16 semanas',         hoy: '19 semanas (32 monoparental), RDL 9/2025' },
];

const RE_NORMA = /\b(Ley\s+\d+\/\d{4}|RDL\s*\d+\/\d{4}|Real Decreto|BOE-A-|LGSS|LIRPF|IRPF|Orden\s+[A-Z]{3}\/|art\.\s*\d+|Seguridad Social|AEAT)\b/g;
const RE_CONST = /^\s*(?:export\s+)?const\s+([A-Z][A-Z0-9_]{2,})\s*(?::[^=]+)?=\s*([\d_]+(?:\.\d+)?)\s*[;,]/gm;
const RE_NOMBRE_FISCAL = /(TIPO|TRAMO|BASE|CUOTA|IMPORTE|LIMITE|MINIMO|MAXIMO|PORCENTAJE|SALARIO|COTIZ|RETENC|DEDUC|BONIF|COEF|ESCALA|UMBRAL|PLAZO|SEMANAS|EDAD|INTERES|IPREM|SMI|IVA|IRPF)/;
const RE_HISTORICO = /hasta 20\d\d|antes de|derogad|hist[oó]ric|anterior a|era de|CORREGIDO/i;

const modulos = readdirSync(DIR).filter((f) => f.endsWith('.ts'));
const riesgos = [];
const huellas = [];
const contrastes = [];

for (const f of modulos) {
  const src = readFileSync(path.join(DIR, f), 'utf8');
  const importaFiscal = /@\/data\/fiscal/.test(src);
  const tool = src.match(/Usada por:\s*MCP server\s*\(([^)]+)\)/)?.[1] ?? null;
  const sello = src.match(/Verificado:\s*(\d{4}-\d{2}(?:-\d{2})?)/)?.[1] ?? null;
  const señales = (src.match(RE_NORMA) ?? []).length;

  // ── Pasada 2: huellas de cifras caducadas (en cualquier módulo)
  src.split('\n').forEach((linea, i) => {
    if (RE_HISTORICO.test(linea)) return;
    // Un módulo que YA importa de data/fiscal no puede tener el dato mal en el código;
    // si la cifra vieja aparece, es una nota que explica la corrección. Reportarla haría
    // que este aviso saliera siempre en rojo, y un aviso que siempre sale deja de leerse.
    const esComentario = /^\s*(\*|\/\/|\/\*)/.test(linea);
    if (esComentario && importaFiscal) return;
    for (const c of CADUCADAS) {
      c.pat.lastIndex = 0;
      if (c.pat.test(linea)) huellas.push({ f, linea: i + 1, texto: linea.trim().slice(0, 120), ...c });
    }
  });

  if (señales < 3) continue; // no maneja normativa (cocina, deporte, física…)

  const constantes = [...src.matchAll(RE_CONST)];
  const cifrasFiscales = constantes.map((m) => m[1]).filter((c) => RE_NOMBRE_FISCAL.test(c));

  // ── Pasada 3: contraste con data/fiscal (solo en los que NO importan)
  if (!importaFiscal) {
    for (const [, nombre, crudo] of constantes) {
      const valor = parseFloat(crudo);
      for (const v of VIGENTES) {
        if (!v.nombres.test(nombre) || Math.abs(valor - v.valor) < 0.01) continue;
        contrastes.push({ f, nombre, valor, ...v, confirmado: v.obsoletos.some((o) => Math.abs(valor - o) < 0.01) });
      }
    }
  }

  // ── Pasada 1: riesgo
  let riesgo = 0;
  if (!importaFiscal) riesgo += 3;
  riesgo += Math.min(3, cifrasFiscales.length);
  if (tool) riesgo += 2;
  if (!sello) riesgo += 1;
  else if (sello < '2025-07') riesgo += 3;
  else if (sello < '2026-01') riesgo += 2;

  riesgos.push({ f, importaFiscal, tool, sello, riesgo });
}

riesgos.sort((a, b) => b.riesgo - a.riesgo || (a.sello ?? '').localeCompare(b.sello ?? ''));

console.log(`\n${riesgos.length} motor(es) con normativa de ${modulos.length} en ${DIR}\n`);

const altos = riesgos.filter((r) => r.riesgo >= 8 && !r.importaFiscal);
console.log(`${altos.length} con datos propios y riesgo alto (sello viejo y/o expuestos al MCP):\n`);
for (const r of altos.slice(0, 25)) {
  console.log(gris(`  [${String(r.riesgo).padStart(2)}] ${(r.sello ?? 'sin sello').padEnd(10)} ${(r.tool ?? '—').padEnd(42)} ${r.f}`));
}
if (altos.length > 25) console.log(gris(`  … y ${altos.length - 25} más`));

console.log(`\n${huellas.length ? rojo(`✗ ${huellas.length} huella(s) de cifras caducadas:`) : verde('✓ Sin huellas de cifras caducadas conocidas.')}`);
for (const h of huellas) {
  console.log(rojo(`  ${h.f}:${h.linea} — ${h.que} → vigente: ${h.hoy}`));
  console.log(gris(`      ${h.texto}`));
}

const confirmados = contrastes.filter((c) => c.confirmado);
console.log(`\n${confirmados.length ? rojo(`✗ ${confirmados.length} constante(s) con valor de un ejercicio anterior:`) : verde('✓ Ninguna constante contradice a data/fiscal.')}`);
for (const c of confirmados) {
  console.log(rojo(`  ${c.f}: ${c.nombre} = ${c.valor} · ${c.magnitud} vigente: ${c.valor !== c.vigente ? c.vigente ?? '' : ''}${c.magnitud ? '' : ''}`));
}

const dudosos = contrastes.filter((c) => !c.confirmado);
if (dudosos.length) {
  console.log(amarillo(`\n${dudosos.length} coincidencia(s) de nombre a revisar a mano (suelen ser otra magnitud):`));
  for (const c of dudosos) console.log(gris(`  ${c.f}: ${c.nombre} = ${c.valor} (¿${c.magnitud}?)`));
}

console.log(
  gris(
    '\nRecuerda: esto solo ve datos que TAMBIÉN están en data/fiscal. Un dato que solo vive en el\n' +
      'motor puede estar mal y salir limpio. La auditoría normativa módulo a módulo no la sustituye nada.\n',
  ),
);

if (huellas.length || confirmados.length) process.exit(1);
