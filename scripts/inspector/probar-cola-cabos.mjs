#!/usr/bin/env node
/**
 * inspector:probar-cola-cabos — que las apps con un cabo del Inspector compitan en la cola por su
 * prioridad, en el tramo de las INVALIDADAS, en vez de esperar detrás de todas
 *
 * Ejecutar:  npm run inspector:probar-cola-cabos
 *
 * EL CASO DE ORIGEN (auditoría de procedimientos, 18/10/2026)
 * ─────────────────────────────────────────────────────────────
 * La skill mandaba meter las apps que nombra un cabo «detrás de las FIRMA e INVALIDADA y por
 * delante de las NUEVAS», y la cola ni las leía: las colocaba Claude a mano. Con 146 INVALIDADAS
 * y 5 apps por tanda, ese bloque no llegaba nunca, y la bandeja del Inspector crecía 6:1 (66
 * altas y 11 cierres en dos semanas). Lo grave no era la cola larga —la mediana de uso de esas
 * apps es 17, frente a 111 en las INVALIDADAS: deben esperar—, sino las excepciones:
 * `lupa-digital` (4.310 usos) y `conversor-braille` (3.714) tenían un cabo y esperaban detrás de
 * 146 apps de menos uso, cuando por su propia prioridad irían las primeras. Decidido por el
 * usuario ese día: compiten por su prioridad de siempre.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. Una app al día con cabo y mucho uso sale en una tanda de 5 por delante de INVALIDADAS de
 *      menos uso, con su cabo a la vista (CASO DE ORIGEN: antes no salía en ninguna).
 *   2. Una app con cabo y poco uso NO se cuela: espera por prioridad, pero está en la cola.
 *   3. Un sujeto que nombra la app dentro de una ruta («simulador-regresion/page.tsx:444») cuenta.
 *   4. Una app nunca inspeccionada con cabo sale una sola vez (no también en NUEVA).
 *   5. No cuentan los cabos cerrados ni los de otro destino.
 *   6. `familia:<id>` de una familia declarada saca la familia entera.
 *   7. `--resumen` dice cuántas apps tienen cabo.
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
ins.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde', firma = NULL").run();

const libres = (sql, ...p) => ins.prepare(sql).all(...p).map((a) => a.slug).filter((s) => !DE_FAMILIA.has(s));
const invalidadas = libres("SELECT slug FROM apps WHERE usos BETWEEN 50 AND 500 AND riesgo >= 2 ORDER BY usos DESC").slice(0, 20);
for (const s of invalidadas) ins.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(s);

const MUCHO_USO = 'lupa-digital';
const [pocoUso, nuncaVista] = libres("SELECT slug FROM apps WHERE usos <= 3 AND segmento <> 'contenido' AND slug <> 'simulador-regresion' ORDER BY slug");
const [otroDestino, cerrada] = libres("SELECT slug FROM apps WHERE usos > 600 AND slug NOT IN (?, 'conversor-braille') ORDER BY usos DESC", MUCHO_USO);
ins.prepare('UPDATE apps SET ultima_inspeccion = NULL, hash_inspeccionado = NULL WHERE slug = ?').run(nuncaVista);
ins.close();

const rutaCabos = path.join(TMP, 'cabos.db');
const cdb = abrirCabos(rutaCabos);
const id = (sujeto, destino = 'inspector') => codigo(alta(cdb, { sujeto, texto: 'sospecha de prueba', origen: 'probar-cola-cabos', destino }).id);
const cMucho = id(MUCHO_USO);
const cPoco = id(pocoUso);
const cRuta = id('simulador-regresion/page.tsx:444');
const cNunca = id(nuncaVista);
id(otroDestino, 'reparar');
const cCerrado = id(cerrada);
cerrar(cdb, Number(cCerrado.slice(1)), { como: 'descartado', motivo: 'prueba' });
const FAM = FAMILIAS.find((f) => f.id === 'compraventa');
id(`familia:${FAM.id}`);
cdb.close();

const correr = (args) => execFileSync(process.execPath, [COLA, ...args], {
  encoding: 'utf8',
  env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos },
  maxBuffer: 16 * 1024 * 1024,
});
const lineaDe = (salida, slug) => salida.split('\n').find((l) => new RegExp(`\\s${slug}\\s`).test(l)) ?? '';
const veces = (salida, slug) => salida.split('\n').filter((l) => new RegExp(`\\s${slug}\\s`).test(l)).length;

// Sin la familia: su cabo la sacaría entera y ocuparía la tanda de 5
const sinFamilia = (() => {
  const db = abrirCabos(rutaCabos);
  const fam = db.prepare("SELECT id FROM cabos WHERE sujeto = ?").get(`familia:${FAM.id}`);
  cerrar(db, fam.id, { como: 'descartado', motivo: 'se reabre en la comprobación 6' });
  db.close();
  return fam.id;
})();

console.log('\n1 · CASO DE ORIGEN: una app al día con cabo y mucho uso sale por delante de INVALIDADAS de menos uso');
const cinco = correr(['5']);
ok(veces(cinco, MUCHO_USO) === 1, `${MUCHO_USO} sale en la tanda de 5`);
ok(lineaDe(cinco, MUCHO_USO).includes(cMucho) || cinco.includes(`cabo ${cMucho}`), `con su cabo a la vista (${cMucho})`);

console.log('\n2 · Una app con cabo y poco uso no se cuela, pero está en la cola');
const todas = correr(['400']);
ok(veces(cinco, pocoUso) === 0, `${pocoUso} no sale en la tanda de 5`);
ok(veces(todas, pocoUso) === 1, `${pocoUso} sí está en la cola completa`);
const tramo = todas.split(/\nNunca inspeccionada/)[0];
ok(tramo.includes(` ${pocoUso} `), '  en el tramo de las INVALIDADAS, no al final de las NUEVAS');

console.log('\n3 · El sujeto que nombra la app dentro de una ruta cuenta');
ok(veces(todas, 'simulador-regresion') === 1 && todas.includes(cRuta), `simulador-regresion sale con ${cRuta}`);

console.log('\n4 · Una app nunca inspeccionada con cabo sale una sola vez');
ok(veces(todas, nuncaVista) === 1, `${nuncaVista} sale una vez`);
ok(todas.includes(cNunca), `  con su cabo (${cNunca})`);

console.log('\n5 · No cuentan los cabos cerrados ni los de otro destino');
ok(veces(todas, otroDestino) === 0, `${otroDestino} (cabo de reparar) no entra`);
ok(veces(todas, cerrada) === 0, `${cerrada} (cabo cerrado) no entra`);

console.log('\n6 · familia:<id> saca la familia entera');
{
  const db = new DatabaseSync(rutaCabos);
  db.prepare("UPDATE cabos SET estado = 'abierto', cierre = NULL, cerrado = NULL WHERE id = ?").run(sinFamilia);
  db.close();
  const conFamilia = correr(['400']);
  ok(conFamilia.includes(`👯 FAMILIA «${FAM.nombre}»`), `la familia «${FAM.nombre}» sale como bloque`);
  ok(FAM.slugs.every((s) => conFamilia.includes(s)), '  con sus hermanas');
}

console.log('\n7 · --resumen cuenta las apps con cabo');
ok(/con cabo del Inspector: \d+ apps/.test(correr(['--resumen'])), 'imprime «con cabo del Inspector: N apps»');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
