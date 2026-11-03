#!/usr/bin/env node
/**
 * inspector:probar-familias — que cada hermana salga SOLA, que su cambio común vaya al testigo y no a
 * Claude, y que ninguna se pierda por el camino
 *
 * Ejecutar:  npm run inspector:probar-familias
 *
 * EL CASO DE ORIGEN (03/11/2026)
 * ──────────────────────────────
 * Con el cupo en 5, `inspector-tarea.mjs lanzar` se plantó: «esta tanda serían 21 apps, no 5». La
 * familia de quizzes salía ENTERA (regla del 23/09/2026) y además reposaba entera o no reposaba (del
 * 26/10): las 5 de inglés nunca vistas arrastraban a 15 hermanas inspeccionadas el 28-29/10 sin un
 * alto. Una tanda de 21 en xhigh agota el plan Max; el usuario no la lanzó y decidió que cada hermana
 * vaya sola y que lo común lo valide el testigo (`cambio-familia.mjs`).
 * La regla anterior salió de compraventa (22/09/2026): garaje y trastero salieron sueltas, el hueco
 * del garaje estaba también en local-comercial y nave-industrial, y reparar las siete en lote
 * (`cfe091a7`) dejó cuatro huecos. Hoy lo cubren el testigo de la familia (en cada build, por
 * `check:familias`) y el tipo `alcance` de `/reparar`.
 *
 * El caso se congela en el commit del día (`INSPECTOR_HEAD=1c7cf5ec`) y en el estado real de esas
 * 20 hermanas en la base: la historia de git no cambia, así que la prueba no envejece.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: con el cupo en 5 salen 5 apps, no 21, y ninguna hermana en reposo.
 *   2. Fuera del reposo, cada una de las 15 sale UNA vez: las de cambio común en la sección del
 *      testigo (literatura-universal, métrica, reinos) y las de commit propio a Claude, con el motivo
 *      (verbos-irregulares por `c5a8fcc8`, la práctica de verbos regulares).
 *   3. Un alto en la última inspección manda la hermana a Claude aunque su cambio sea común.
 *   4. Un fallo del testigo anotado para su código de hoy la manda a Claude con el motivo; si su
 *      código cambió desde el fallo, vuelve al testigo.
 *   5. Qué commit es común: los umbrales, con los commits reales que los fijaron.
 *   6. Qué hace el testigo con el informe: entero en verde o ninguna.
 *   7. CONTROL: una app que no es de familia sale sola y sin bloque de familia.
 *   8. Un slug declarado que ya no existe se DENUNCIA.
 *
 * Ninguna toca las bases reales: van por `INSPECTOR_DB` y `CABOS_DB`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { RUTA_BASE, RAIZ } from './db.mjs';
import { FAMILIAS } from './familias.mjs';
import { tipoDeCommit, decidir, claveFallo } from './cambio-familia.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COLA = path.join(AQUI, 'cola.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'probar-familias-'));
const QUIZ = FAMILIAS.find((f) => f.id === 'quizzes');
const DE_FAMILIA = new Set(FAMILIAS.flatMap((f) => f.slugs));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

/** El 03/11/2026, en la base: `validada` de las 15 que habían cambiado (de ella sale la base del diff). */
const CAMBIADAS = {
  'quiz-literatura-universal': '2026-10-31T15:33:11.353Z',
  'quiz-historia-espana': '2026-10-28T10:09:53.814Z',
  'quiz-geografia-espana': '2026-10-29T15:42:24.911Z',
  'quiz-simbolos-quimicos': '2026-10-31T15:33:11.355Z',
  'quiz-tabla-periodica': '2026-10-29T15:01:07.861Z',
  'quiz-verbos-irregulares': '2026-10-29T14:43:28.532Z',
  'quiz-paises-capitales': '2026-10-29T15:21:56.737Z',
  'quiz-complejidad-algoritmos': '2026-10-29T15:42:23.583Z',
  'quiz-conceptos-financieros': '2026-10-29T07:32:18.650Z',
  'quiz-conceptos-inversion': '2026-10-29T07:44:09.501Z',
  'quiz-figuras-retoricas': '2026-10-29T15:01:08.609Z',
  'quiz-metrica-estrofas': '2026-10-29T15:21:57.816Z',
  'quiz-reinos-naturaleza': '2026-10-29T15:42:24.274Z',
  'quiz-tipos-plantas': '2026-10-29T07:32:19.407Z',
  'quiz-mitos-ciencia': '2026-10-29T07:32:20.356Z',
};
const NUNCA_VISTAS = ['tiempos-verbales-ingles', 'condicionales-ingles', 'numeros-en-ingles', 'preposiciones-ingles', 'pronombres-ingles'];
const COMUNES_ESPERADAS = ['quiz-literatura-universal', 'quiz-metrica-estrofas', 'quiz-reinos-naturaleza'];

// ── Montaje: catálogo al día y sin historial; las 20 hermanas como estaban el 03/11/2026 ──────
const rutaIns = path.join(TMP, 'inspector.db');
fs.copyFileSync(RUTA_BASE, rutaIns);
{
  const db = new DatabaseSync(rutaIns);
  db.prepare('DELETE FROM hallazgos').run();
  db.prepare('DELETE FROM inspecciones').run();
  db.prepare("DELETE FROM meta WHERE clave LIKE 'testigo-fallo:%'").run();
  db.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', validada = NULL, hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde', firma = NULL, firma_desde = NULL").run();
  for (const [slug, validada] of Object.entries(CAMBIADAS)) {
    db.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano', validada = ? WHERE slug = ?").run(validada, slug);
  }
  for (const s of NUNCA_VISTAS) db.prepare('UPDATE apps SET ultima_inspeccion = NULL, hash_inspeccionado = NULL, validada = NULL WHERE slug = ?').run(s);
  db.close();
}
/** Última inspección de las 15 hace `dias` días, sin hallazgos (en reposo si < 30). */
function inspeccionadasHace(dias) {
  const db = new DatabaseSync(rutaIns);
  for (const slug of Object.keys(CAMBIADAS)) db.prepare('UPDATE apps SET ultima_inspeccion = ? WHERE slug = ?').run(haceDias(dias), slug);
  db.close();
}

const rutaCabos = path.join(TMP, 'cabos-inexistente.db');
const correr = (args) => execFileSync(process.execPath, [COLA, ...args], {
  encoding: 'utf8',
  env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos, INSPECTOR_HEAD: '1c7cf5ec' },
  maxBuffer: 16 * 1024 * 1024,
});
const seccion = (salida, inicio) => (salida.split(/\n(?=\S)/).find((b) => b.startsWith(inicio)) ?? '');
const listaClaude = (salida) => seccion(salida, 'Por valor esperado');
const listaTestigo = (salida) => seccion(salida, 'Familia — cambio COMÚN');
// Solo líneas de app («  35  slug …» en la lista, «       slug …» en la del testigo): la línea
// «referencia: quiz-literatura-universal» del bloque de familia no es que la app salga
const esLineaDe = (l, slug) => new RegExp(`^\\s+(\\d+\\s+)?${slug}\\s`).test(l);
const veces = (texto, slug) => texto.split('\n').filter((l) => esLineaDe(l, slug)).length;
const lineaDe = (texto, slug) => texto.split('\n').find((l) => esLineaDe(l, slug)) ?? '';

console.log('\n1 · CASO DE ORIGEN: con el cupo en 5 salen 5 apps, no 21');
inspeccionadasHace(5);
{
  const json = JSON.parse(correr(['5', '--json']));
  ok(json.apps === 5, `la tanda de 5 saca 5 apps para Claude (sale ${json.apps}; el 03/11 eran 21)`);
  const cola = correr(['5']);
  ok(!/FAMILIA «.*» — se inspeccionan JUNTAS/.test(cola), '  ninguna familia sale entera');
  ok(Object.keys(CAMBIADAS).every((s) => veces(listaClaude(cola), s) === 0), '  ninguna de las 15 en reposo va a Claude');
  ok(NUNCA_VISTAS.every((s) => / · primera · 👯 quizzes/.test(lineaDe(cola, s))), '  las 5 nunca vistas salen solas, en primera y con su familia a la vista');
  ok(cola.includes(`testigo:    ${QUIZ.testigo}`) && cola.includes(`referencia: ${QUIZ.referencia}`) && /invariante:/.test(cola),
    '  el bloque de su familia (testigo, referencia, invariante) va debajo');
}

console.log('\n2 · Fuera del reposo, cada hermana sale UNA vez: lo común al testigo, lo propio a Claude');
inspeccionadasHace(40);
let colaLarga;
{
  colaLarga = correr(['400']);
  const claude = listaClaude(colaLarga), testigo = listaTestigo(colaLarga);
  ok(Object.keys(CAMBIADAS).every((s) => veces(claude, s) + veces(testigo, s) === 1), '  ninguna se pierde ni sale dos veces');
  ok(COMUNES_ESPERADAS.every((s) => veces(testigo, s) === 1 && veces(claude, s) === 0),
    `  al testigo: ${COMUNES_ESPERADAS.join(', ')}`);
  ok(/· 👯 quizzes \(commit propio: [0-9a-f, ]*c5a8fcc8/.test(lineaDe(claude, 'quiz-verbos-irregulares')),
    '  quiz-verbos-irregulares va a Claude por c5a8fcc8, con el motivo en la línea');
  const json = JSON.parse(correr(['400', '--json']));
  ok(json.testigo === COMUNES_ESPERADAS.length, `  el JSON cuenta ${COMUNES_ESPERADAS.length} para el testigo (cuenta ${json.testigo}) y no los mete en el cupo`);
}

console.log('\n3 · Un alto en la última inspección manda la hermana a Claude aunque su cambio sea común');
{
  const s = 'quiz-literatura-universal';
  const db = new DatabaseSync(rutaIns);
  const { lastInsertRowid: id } = db.prepare("INSERT INTO inspecciones (slug, fecha, veredicto) VALUES (?, ?, 'prueba')").run(s, haceDias(40));
  db.prepare("INSERT INTO hallazgos (inspeccion_id, slug, severidad, descripcion, caso, fecha) VALUES (?, ?, 'alto', 'prueba', 'prueba', ?)").run(id, s, haceDias(40));
  db.close();
  const cola = correr(['400']);
  ok(veces(listaTestigo(cola), s) === 0 && /dejó un alto/.test(lineaDe(listaClaude(cola), s)), `${s} va a Claude, «su última inspección dejó un alto»`);
  const db2 = new DatabaseSync(rutaIns);
  db2.prepare('DELETE FROM hallazgos').run();
  db2.prepare('DELETE FROM inspecciones').run();
  db2.close();
}

console.log('\n4 · Un fallo del testigo vale para el código de ese momento');
{
  const s = 'quiz-reinos-naturaleza';
  const db = new DatabaseSync(rutaIns);
  const fila = db.prepare('SELECT hash_codigo, hash_deps FROM apps WHERE slug = ?').get(s);
  const poner = (huella) => db.prepare('INSERT INTO meta (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor')
    .run(claveFallo(s), JSON.stringify({ huella, motivo: 'testigo en ROJO (prueba)', fecha: '2026-11-03' }));
  poner(`${fila.hash_codigo}|${fila.hash_deps || ''}`);
  let cola = correr(['400']);
  ok(veces(listaTestigo(cola), s) === 0 && /el testigo no la validó: testigo en ROJO/.test(lineaDe(listaClaude(cola), s)),
    `${s}, con el fallo anotado para su código de hoy, va a Claude con el motivo`);
  poner('huella-de-antes|');
  cola = correr(['400']);
  ok(veces(listaTestigo(cola), s) === 1, '  y si su código cambió desde el fallo, vuelve al testigo');
  db.close();
}

console.log('\n5 · Qué commit es común (umbrales fijados con los commits reales del 03/11)');
ok(tipoDeCommit({ apps: 15, hermanas: 15 }) === 'familia', '184a1872 (✓/✗ en las quince) es de familia');
ok(tipoDeCommit({ apps: 19, hermanas: 3 }) === 'familia', 'cccd8972 (3 hermanas de 19 apps) es de familia');
ok(tipoDeCommit({ apps: 40, hermanas: 1 }) === 'campaña', '147db49f (contraste en 40 apps) es de campaña');
ok(tipoDeCommit({ apps: 2, hermanas: 2 }) === 'propio', '56bfa250 (contenido en dos quizzes) es propio');
ok(tipoDeCommit({ apps: 4, hermanas: 1 }) === 'propio', '21b793a0 (el wolframio, 4 apps) es propio');
ok(tipoDeCommit({ apps: 20, hermanas: 1 }) === 'propio', '20 apps no es campaña: el umbral es MÁS de 20');
ok(tipoDeCommit({ apps: 1, hermanas: 1 }) === 'propio', 'c5a8fcc8 (una sola app) es propio');

console.log('\n6 · El testigo entero en verde, o ninguna');
{
  const testigo = path.resolve(RAIZ, QUIZ.testigo).toLowerCase();
  const candidatas = [{ slug: 'a', testigo: QUIZ.testigo, commits: [{ sha: '184a1872' }, { sha: 'cccd8972' }] }, { slug: 'b', testigo: QUIZ.testigo, commits: [{ sha: '184a1872' }] }];
  const con = (estado) => decidir({ raiz: RAIZ, candidatas, verde: new Map(estado ? [[testigo, estado]] : []) });
  const verde = con('verde');
  ok(verde.revalidar.length === 2 && verde.fallos.length === 0 && verde.revalidar[0].shas.join() === '184a1872,cccd8972',
    'testigo en verde: las dos se intentan revalidar, cada una con SUS commits');
  ok(con('rojo').revalidar.length === 0 && /en ROJO/.test(con('rojo').fallos[0].motivo), 'testigo en rojo: ninguna, con el motivo');
  ok(con('inestable').revalidar.length === 0, 'testigo inestable (pasó al reintentar): ninguna');
  ok(con(null).revalidar.length === 0 && /sin resultado/.test(con(null).fallos[0].motivo), 'testigo ausente del informe: ninguna');
}

console.log('\n7 · CONTROL: una app que no es de familia sale sola y sin bloque de familia');
{
  const db = new DatabaseSync(rutaIns);
  for (const s of [...Object.keys(CAMBIADAS), ...NUNCA_VISTAS]) {
    db.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, '') WHERE slug = ?").run(s);
  }
  const suelta = db.prepare('SELECT slug FROM apps WHERE usos > 100 ORDER BY usos DESC').all().map((a) => a.slug).find((s) => !DE_FAMILIA.has(s));
  db.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(suelta);
  db.close();
  const cola = correr(['12']);
  ok(veces(listaClaude(cola), suelta) === 1, `${suelta} sale en la cola`);
  ok(!cola.includes('👯'), '  y no se imprime nada de familias');
}

console.log('\n8 · Un slug declarado que ya no existe en el catálogo se DENUNCIA');
{
  const db = new DatabaseSync(rutaIns);
  db.prepare('DELETE FROM apps WHERE slug = ?').run(QUIZ.slugs[1]);
  db.close();
  const salida = correr(['--resumen']);
  ok(salida.includes('ya no existen') && salida.includes(QUIZ.slugs[1]), `nombra el slug huérfano (${QUIZ.slugs[1]})`);
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobación(es) fallida(s)\n` : '\n✓ Cada hermana sale sola, lo común va al testigo y ninguna se pierde\n');
process.exit(fallos ? 1 : 0);
