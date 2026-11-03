#!/usr/bin/env node
/**
 * inspector:validar-familias — valida con el TESTIGO de su familia, sin Claude, las hermanas cuyo
 * cambio es común (de familia o de campaña)
 *
 * Ejecutar:  npm run inspector:validar-familias                (ejecuta testigos y specs, y revalida)
 *            npm run inspector:validar-familias -- --listar    (solo dice qué haría)
 *            npm run inspector:validar-familias -- --familia quizzes   (solo esa familia)
 *            npm run inspector:validar-familias -- --informe <json>   (con un informe ya hecho)
 *
 * Lo ejecuta la tarea «Inspector meskeIA» con el servidor de la copia ya arriba (3052) y ANTES de
 * llamar a Claude, así que la cola que lee Claude ya no trae esas hermanas. En conversación (respaldo
 * de la skill), antes de la cola. Criterio, caso de origen y límite: `cambio-familia.mjs`.
 *
 * Por cada familia con candidatas: `npx playwright test <testigo> <specs de las candidatas>
 * --reporter=json`. Si el testigo no sale entero en verde, ninguna se revalida. Si sale, cada hermana
 * pasa por `cerrar.mjs --revalidar-commits <sus commits> --informe <json>`, que exige además que esos
 * commits expliquen TODO su cambio y su spec en verde. Lo que no se revalida se anota en `meta`
 * (`testigo-fallo:<slug>`) con la huella de ese momento: la cola lo manda a Claude, con el motivo,
 * hasta que su código vuelva a cambiar. No llama a ningún modelo.
 *
 * Código de salida: 0 aunque alguna no se valide (no es un error: va a Claude); 1 si Playwright no
 * dejó informe, y entonces no anota nada (se reintenta la próxima vez).
 *
 * ⚠️ Necesita un servidor de PRODUCCIÓN en el puerto de las pruebas. Contra `next dev`, que es lo
 * que levanta Playwright si no hay ninguno, el testigo de quizzes pasó de 10 minutos (03/11/2026);
 * contra `next start`, `check:familias` corre todos los testigos en ~2,5 min. La tarea ya lo tiene en
 * el 3052. En conversación: `npm run build && npx next start -p 3050` antes.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { abrir, RAIZ, SQL_INVALIDADA } from './db.mjs';
import { FAMILIAS, familiaDe } from './familias.mjs';
import { clasificarHermana, decidir, anotarFallo, borrarFallo } from './cambio-familia.mjs';
import { specsDelInforme } from './informe-playwright.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const valorDe = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : null; };
const LISTAR = args.includes('--listar');
const INFORME = valorDe('informe');
/** Solo una familia (`--familia quizzes`): para validarla a mano sin esperar a las demás. */
const SOLO = valorDe('familia');
if (SOLO && !FAMILIAS.some((f) => f.id === SOLO)) {
  console.error(`✗ --familia ${SOLO}: no es una familia declarada (${FAMILIAS.map((f) => f.id).join(', ')})`);
  process.exit(1);
}

const db = abrir();
const enSql = (lista) => `(${lista.filter((s) => /^[a-z0-9-]+$/.test(s)).map((s) => `'${s}'`).join(', ') || "''"})`;
const filas = db.prepare(`SELECT * FROM apps WHERE slug IN ${enSql(FAMILIAS.flatMap((f) => f.slugs))} AND ${SQL_INVALIDADA}`).all();

/** Las candidatas por familia: { familia, hermanas: [{ fila, commits }] }. */
const porFamilia = new Map();
for (const fila of filas) {
  const c = clasificarHermana(db, RAIZ, fila);
  if (!c.comun) continue;
  const familia = familiaDe(fila.slug);
  if (SOLO && familia.id !== SOLO) continue;
  if (!porFamilia.has(familia.id)) porFamilia.set(familia.id, { familia, hermanas: [] });
  porFamilia.get(familia.id).hermanas.push({ fila, commits: c.commits });
}

if (!porFamilia.size) {
  console.log('Testigos de familia: ninguna hermana con cambio común que validar.');
  process.exit(0);
}

for (const { familia, hermanas } of porFamilia.values()) {
  console.log(`\n👯 «${familia.nombre}» · testigo ${familia.testigo}`);
  for (const h of hermanas) console.log(`   ${h.fila.slug.padEnd(44)} ${h.commits.map((c) => `${c.sha} (${c.tipo})`).join(' · ')}`);
}
if (LISTAR) process.exit(0);

let validadas = 0, noValidadas = 0, sinCorrer = 0;

/**
 * Ejecuta Playwright con el reporter JSON y devuelve la ruta del informe, o null si no lo dejó. Sin
 * informe, Playwright no llegó a decir nada (cortado, servidor caído): NO es un testigo en rojo, y no
 * se anota fallo, que mandaría las hermanas a Claude; se reintenta la próxima vez. Caso: 03/11/2026,
 * el límite de 10 minutos de fuera lo cortó dos veces.
 */
function playwright(ficheros, banderas, nombre) {
  const informe = path.join(os.tmpdir(), `${nombre}.json`);
  console.log(`\n  playwright ${banderas.join(' ')}: ${ficheros.join(' ')}`);
  const t0 = Date.now();
  const r = spawnSync(`npx playwright test ${ficheros.join(' ')} ${banderas.join(' ')} --reporter=json`, {
    cwd: RAIZ, shell: true, encoding: 'utf8', timeout: 30 * 60 * 1000, maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: informe },
  });
  if (!fs.existsSync(informe)) {
    console.error(`  ✗ Playwright no dejó informe (código ${r.status}): no se valida ni se anota nada; se reintenta la próxima vez`);
    console.error(`    ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ')}`);
    return null;
  }
  console.log(`    ${Math.round((Date.now() - t0) / 1000)} s · código ${r.status}`);
  return informe;
}
for (const { familia, hermanas } of porFamilia.values()) {
  // Una hermana sin spec no se puede revalidar (lo exige --revalidar-commits): va a Claude
  const conSpec = hermanas.filter((h) => h.fila.test_path && fs.existsSync(path.join(RAIZ, h.fila.test_path)));
  for (const h of hermanas.filter((x) => !conSpec.includes(x))) {
    anotarFallo(db, h.fila, 'sin spec propio en tests/apps');
    noValidadas++;
    console.log(`  ✗ ${h.fila.slug}: sin spec propio en tests/apps`);
  }
  if (!conSpec.length) continue;

  // Dos ejecuciones, como las del resto del ciclo: el testigo como `check:familias` (sus casos son
  // independientes: --fully-parallel con 12 workers) y los specs como la suite de /reparar (4
  // workers que se reparten FICHEROS: hay specs cuyos tests dependen del orden). Con la
  // configuración por defecto (1 worker) el testigo de quizzes, 252 casos, pasaba de 10 minutos
  // (03/11/2026). `informeSpecs` es el que lee `--revalidar-commits`.
  let informeSpecs = INFORME, informeTestigo = INFORME;
  if (!INFORME) {
    const marca = `${familia.id}-${Date.now()}`;
    informeTestigo = playwright([familia.testigo], ['--fully-parallel', '--workers=12'], `testigo-${marca}`);
    informeSpecs = informeTestigo && playwright(conSpec.map((h) => h.fila.test_path), ['--workers=4'], `specs-${marca}`);
    if (!informeTestigo || !informeSpecs) { sinCorrer++; continue; }
  }

  let verde;
  try {
    verde = new Map([...specsDelInforme(informeTestigo), ...specsDelInforme(informeSpecs)]);
  } catch (e) {
    console.error(`  ✗ ${e.message}: no se valida ni se anota nada`);
    sinCorrer++;
    continue;
  }
  const informe = informeSpecs;
  const { revalidar, fallos } = decidir({
    raiz: RAIZ, verde,
    candidatas: conSpec.map((h) => ({ slug: h.fila.slug, testigo: familia.testigo, commits: h.commits })),
  });
  const filaDe = (slug) => conSpec.find((h) => h.fila.slug === slug).fila;
  for (const f of fallos) { anotarFallo(db, filaDe(f.slug), f.motivo); noValidadas++; console.log(`  ✗ ${f.slug}: ${f.motivo}`); }

  for (const r of revalidar) {
    const salida = spawnSync(process.execPath, [path.join(AQUI, 'cerrar.mjs'), '--revalidar-commits', r.shas.join(','), '--informe', informe], {
      cwd: RAIZ, encoding: 'utf8', env: process.env, maxBuffer: 16 * 1024 * 1024,
    });
    const sigue = db.prepare(`SELECT 1 x FROM apps WHERE slug = ? AND ${SQL_INVALIDADA}`).get(r.slug);
    if (!sigue) {
      borrarFallo(db, r.slug);
      validadas++;
      console.log(`  ✓ ${r.slug}: revalidada por el testigo y su spec (${r.shas.join(', ')})`);
      continue;
    }
    // El motivo, de la línea de --revalidar-commits que la nombra; si no la hay, el de su código
    const texto = `${salida.stdout || ''}\n${salida.stderr || ''}`;
    const bloque = texto.split(/\n(?=\S)/).find((b) => b.includes(r.slug));
    const motivo = bloque ? bloque.split('\n')[0].replace(/\s*\(\d+\): se quedan en la cola/, '').trim() : `revalidar-commits sin revalidarla (código ${salida.status})`;
    anotarFallo(db, filaDe(r.slug), motivo);
    noValidadas++;
    console.log(`  ✗ ${r.slug}: ${motivo}`);
  }
}

console.log(`\nTestigos de familia: ${validadas} hermana(s) validada(s) sin Claude · ${noValidadas} van a Claude por valor, con su motivo en la cola` +
  `${sinCorrer ? ` · ${sinCorrer} familia(s) sin informe de Playwright: se reintentan la próxima vez` : ''}`);
process.exit(sinCorrer ? 1 : 0);
