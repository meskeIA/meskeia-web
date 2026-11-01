#!/usr/bin/env node
/**
 * inspector:probar-cola-cabos — que un cabo del Inspector no espere, y que se resuelva con una
 * comprobación PUNTUAL de su pregunta, no con una inspección entera de la app ni de su familia
 *
 * Ejecutar:  npm run inspector:probar-cola-cabos
 *
 * LOS DOS CASOS DE ORIGEN
 * ───────────────────────
 * 18/10/2026: la cola no leía los cabos y la skill mandaba sus apps detrás de 146 INVALIDADAS:
 * `lupa-digital` (4.310 usos) y `conversor-braille` (3.714) tenían un cabo y no salían nunca.
 * Decidido por el usuario: un cabo no espera.
 * 01/11/2026 (auditoría de los procesos de revisión): la respuesta de entonces —meter la app en el
 * tramo de las INVALIDADAS— la inspeccionaba ENTERA aunque reposara, y un cabo `familia:<id>`
 * sacaba la familia completa. Con 125 cabos abiertos entrando 34 a la semana, el reposo del 26/10
 * no cambió la mezcla: 71 repeticiones y 9 primeras inspecciones en seis días. Decidido por el
 * usuario: el cabo de una app ya vista va a un carril aparte, de comprobación puntual, fuera del
 * cupo, como mucho 3 por tanda y por prioridad.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: una app ya vista, al día, con cabo y mucho uso sale en una tanda de 5, en el
 *      carril de cabos y como comprobación puntual.
 *   2. El carril no gasta cupo: la tanda de 5 sigue sacando 5 apps además de los cabos.
 *   3. Como mucho 3 por tanda, por prioridad: la de poco uso espera, y la cabecera dice cuántas.
 *   4. El sujeto que nombra la app dentro de una ruta («simulador-regresion/page.tsx:444») cuenta.
 *   5. Una app nunca vista con cabo sale UNA vez, en su primera inspección, con la pregunta a la vista.
 *   6. No cuentan los cabos cerrados ni los de otro destino.
 *   7. CASO DE ORIGEN: `familia:<id>` de una familia ya vista es UNA comprobación con su testigo, no
 *      la familia entera.
 *   8. Una app con cabo que ya sale en la tanda por valor lleva su cabo allí y no se repite abajo.
 *   9. `--resumen` dice cuántas apps tienen cabo.
 *
 * Ninguna toca las bases reales: van por `INSPECTOR_DB` y `CABOS_DB`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { RUTA_BASE } from './db.mjs';
import { FAMILIAS } from './familias.mjs';
import { abrir as abrirCabos, alta, cerrar, codigo } from '../cabos/cabos.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COLA = path.join(AQUI, 'cola.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cola-cabos-'));
const DE_FAMILIA = new Set(FAMILIAS.flatMap((f) => f.slugs));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };

// ── Montaje: todo el catálogo al día salvo 20 INVALIDADAS de uso medio ──────────────────
const rutaIns = path.join(TMP, 'inspector.db');
fs.copyFileSync(RUTA_BASE, rutaIns);
const ins = new DatabaseSync(rutaIns);
ins.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', validada = NULL, hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde', firma = NULL").run();

const libres = (sql, ...p) => ins.prepare(sql).all(...p).map((a) => a.slug).filter((s) => !DE_FAMILIA.has(s));
const invalidadas = libres("SELECT slug FROM apps WHERE usos BETWEEN 50 AND 500 AND riesgo >= 2 ORDER BY usos DESC").slice(0, 20);
for (const s of invalidadas) ins.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(s);

const MUCHO_USO = 'lupa-digital';
const [pocoUso, nuncaVista] = libres("SELECT slug FROM apps WHERE usos <= 3 AND segmento <> 'contenido' AND slug <> 'simulador-regresion' ORDER BY slug");
const [otroDestino, cerrada, alta1, alta2] = libres("SELECT slug FROM apps WHERE usos > 600 AND slug NOT IN (?, 'conversor-braille', 'simulador-regresion') ORDER BY usos DESC", MUCHO_USO);
for (const s of [nuncaVista, 'simulador-regresion']) ins.prepare('UPDATE apps SET ultima_inspeccion = NULL, hash_inspeccionado = NULL WHERE slug = ?').run(s);
ins.close();

const rutaCabos = path.join(TMP, 'cabos.db');
const cdb = abrirCabos(rutaCabos);
const id = (sujeto, destino = 'inspector') => codigo(alta(cdb, { sujeto, texto: 'sospecha de prueba', origen: 'probar-cola-cabos', destino }).id);
const cMucho = id(MUCHO_USO);
const cPoco = id(pocoUso);
id(alta1);
id(alta2);
const cRuta = id('simulador-regresion/page.tsx:444');
const cNunca = id(nuncaVista);
id(otroDestino, 'reparar');
const cCerrado = id(cerrada);
cerrar(cdb, Number(cCerrado.slice(1)), { como: 'descartado', motivo: 'prueba' });
const FAM = FAMILIAS.find((f) => f.id === 'compraventa');
const cFam = id(`familia:${FAM.id}`);
cerrar(cdb, Number(cFam.slice(1)), { como: 'descartado', motivo: 'se reabre en la comprobación 7' });
cdb.close();

const correr = (args) => execFileSync(process.execPath, [COLA, ...args], {
  encoding: 'utf8',
  env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos },
  maxBuffer: 16 * 1024 * 1024,
});
const lineaDe = (salida, slug) => salida.split('\n').find((l) => new RegExp(`\\s${slug}\\s`).test(l)) ?? '';
const veces = (salida, slug) => salida.split('\n').filter((l) => new RegExp(`\\s${slug}\\s`).test(l)).length;
const carril = (salida) => salida.split(/\nCabo — /)[1] ?? '';

console.log('\n1 · CASO DE ORIGEN (18/10): una app ya vista con cabo y mucho uso no espera');
const cinco = correr(['5']);
ok(veces(cinco, MUCHO_USO) === 1, `${MUCHO_USO} sale en la tanda de 5`);
ok(carril(cinco).includes(MUCHO_USO) && lineaDe(cinco, MUCHO_USO).includes(`cabo ${cMucho}: comprobación puntual`),
  `  en el carril de cabos, como comprobación puntual de ${cMucho}`);

console.log('\n2 · El carril no gasta cupo');
const json = JSON.parse(correr(['5', '--json']));
ok(json.apps === 5, `la tanda de 5 saca 5 apps (sale ${json.apps})`);
ok(json.cabos >= 1 && json.cabos <= 3, `  y además ${json.cabos} comprobaciones de cabo`);

console.log('\n3 · Como mucho 3 por tanda, por prioridad');
const enCarril = carril(cinco).split('\n').filter((l) => /comprobación puntual/.test(l)).length;
ok(enCarril === 3, `3 comprobaciones en el carril (salen ${enCarril})`);
ok(veces(cinco, pocoUso) === 0, `${pocoUso} (poco uso) espera`);
const espera = cinco.match(/aparte del cupo; (\d+) esperan/);
ok(espera && Number(espera[1]) >= 4, `  la cabecera dice cuántas esperan (${espera ? espera[1] : 'nada'})`);

console.log('\n4 · El sujeto que nombra la app dentro de una ruta cuenta');
const todas = correr(['900']);
ok(veces(todas, 'simulador-regresion') === 1 && lineaDe(todas, 'simulador-regresion').includes(cRuta), `simulador-regresion sale con ${cRuta}`);

console.log('\n5 · Una app nunca vista con cabo sale una vez, en su primera inspección');
ok(veces(todas, nuncaVista) === 1, `${nuncaVista} sale una vez`);
ok(/· primera · cabo /.test(lineaDe(todas, nuncaVista)) && lineaDe(todas, nuncaVista).includes(cNunca), `  como primera, con su cabo (${cNunca})`);
ok(!carril(todas).includes(nuncaVista), '  y no en el carril de cabos');

console.log('\n6 · No cuentan los cabos cerrados ni los de otro destino');
ok(veces(todas, otroDestino) === 0, `${otroDestino} (cabo de reparar) no entra`);
ok(veces(todas, cerrada) === 0, `${cerrada} (cabo cerrado) no entra`);

console.log('\n7 · CASO DE ORIGEN (01/11): un cabo de familia es UNA comprobación, no la familia entera');
{
  const db = new DatabaseSync(rutaCabos);
  db.prepare("UPDATE cabos SET estado = 'abierto', cierre = NULL, cerrado = NULL WHERE id = ?").run(Number(cFam.slice(1)));
  db.close();
  const conFamilia = correr(['5']);
  ok(!conFamilia.includes(`👯 FAMILIA «${FAM.nombre}»`), `la familia «${FAM.nombre}» no sale entera`);
  ok(new RegExp(`👯 familia «${FAM.nombre}».*cabo ${cFam}: comprobación puntual con su testigo`).test(conFamilia),
    '  sale una entrada de familia, con su testigo');
  ok(FAM.slugs.every((s) => veces(conFamilia, s) === 0), '  sin sus hermanas sueltas');
}

console.log('\n8 · Una app con cabo que sale por valor lleva su cabo allí');
{
  const db = new DatabaseSync(rutaIns);
  db.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(MUCHO_USO);
  db.close();
  const conCambio = correr(['5']);
  ok(veces(conCambio, MUCHO_USO) === 1, `${MUCHO_USO} sale una sola vez`);
  ok(/· cambio desde .*· cabo C\d+/.test(lineaDe(conCambio, MUCHO_USO)), '  en modo cambio y con su cabo');
}

console.log('\n9 · --resumen cuenta las apps con cabo');
ok(/con cabo del Inspector: \d+ apps/.test(correr(['--resumen'])), 'imprime «con cabo del Inspector: N apps»');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
