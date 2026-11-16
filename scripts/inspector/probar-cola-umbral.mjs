#!/usr/bin/env node
/**
 * inspector:probar-cola-umbral — que la cola no saque primeras con la pila de medios por encima del
 * umbral, y que lo que no es una primera siga saliendo
 *
 * Ejecutar:  npm run inspector:probar-cola-umbral
 *
 * EL CASO DE ORIGEN (16/11/2026)
 * ──────────────────────────────
 * Del 26/10 al 15/11 entraron 1.302 hallazgos y se cerraron 859: la pila llegó a 487 abiertos, 178
 * de ellos medios o altos. Las primeras (9,7 hallazgos de media frente a 1,8 de un cambio) eran el
 * grifo, y caían ya en apps de 21 usos de media. Decidido por el usuario: con más de 100 medios,
 * altos o críticos abiertos, no hay primeras. Detalle: cabecera de `umbralPrimeras` en `db.mjs`.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: con 101 medios abiertos, la nunca vista de más uso NO sale.
 *   2. Con el paso cerrado siguen saliendo un cambio y la primera de una app con cabo.
 *   3. Con 100 justos, la nunca vista sale.
 *   4. Los bajos no cuentan: 100 medios y 50 bajos dejan el paso abierto.
 *   5. `--json` y `--resumen` dicen si el paso está cerrado y con cuántos.
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
import { abrir as abrirCabos, alta } from '../cabos/cabos.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COLA = path.join(AQUI, 'cola.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cola-umbral-'));
const DE_FAMILIA = new Set(FAMILIAS.flatMap((f) => f.slugs));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

// ── Montaje: todo el catálogo inspeccionado hace 40 días, al día y sin historial ──────────────
const rutaIns = path.join(TMP, 'inspector.db');
fs.copyFileSync(RUTA_BASE, rutaIns);
const ins = new DatabaseSync(rutaIns);
ins.prepare('DELETE FROM hallazgos').run();
ins.prepare('DELETE FROM inspecciones').run();
ins.prepare(`UPDATE apps SET ultima_inspeccion = ?, hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''),
  test_estado = 'verde', firma = NULL, firma_desde = NULL`).run(haceDias(40));

const [nuncaVista, conCabo, cambiada] = ins
  .prepare('SELECT slug FROM apps WHERE usos > 50 ORDER BY usos DESC').all()
  .map((a) => a.slug).filter((s) => !DE_FAMILIA.has(s));
ins.prepare('UPDATE apps SET ultima_inspeccion = NULL, hash_inspeccionado = NULL WHERE slug IN (?, ?)').run(nuncaVista, conCabo);
ins.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(cambiada);
ins.close();

const rutaCabos = path.join(TMP, 'cabos.db');
const cdb = abrirCabos(rutaCabos);
alta(cdb, { sujeto: conCabo, texto: 'sospecha de prueba', origen: 'probar-cola-umbral', destino: 'inspector' });
cdb.close();

/** Deja en la base exactamente esos hallazgos abiertos, en apps que no intervienen. */
function pila(medios, bajos = 0) {
  const db = new DatabaseSync(rutaIns);
  db.prepare('DELETE FROM hallazgos').run();
  const poner = db.prepare("INSERT INTO hallazgos (slug, severidad, descripcion, caso, fecha) VALUES ('app-ajena', ?, 'prueba', 'prueba', ?)");
  for (let i = 0; i < medios; i++) poner.run('medio', haceDias(1));
  for (let i = 0; i < bajos; i++) poner.run('bajo', haceDias(1));
  db.close();
}

const correr = (args) => execFileSync(process.execPath, [COLA, ...args], {
  encoding: 'utf8',
  env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos },
  maxBuffer: 16 * 1024 * 1024,
});
const sale = (salida, slug) => salida.split('\n').some((l) => new RegExp(`\\s${slug}\\s`).test(l));

console.log('\n1 · CASO DE ORIGEN: con 101 medios abiertos no hay primeras');
pila(101);
let cola = correr(['50']);
ok(!sale(cola, nuncaVista), `${nuncaVista} (nunca vista, la de más uso) no sale`);
ok(cola.includes('PRIMERAS CERRADAS: 101'), '  y la cola lo dice, con la cifra');

console.log('\n2 · Con el paso cerrado, lo que no es una primera sigue saliendo');
ok(sale(cola, cambiada), `${cambiada} (cambiada) sale en modo cambio`);
ok(sale(cola, conCabo) && cola.includes('· primera · cabo C'), `${conCabo} (nunca vista, con cabo) sale: un cabo no espera`);

console.log('\n3 · Con 100 justos, el paso está abierto');
pila(100);
cola = correr(['50']);
ok(sale(cola, nuncaVista), `${nuncaVista} sale`);
ok(!cola.includes('PRIMERAS CERRADAS'), '  sin aviso de paso cerrado');

console.log('\n4 · Los bajos no cuentan');
pila(100, 50);
ok(sale(correr(['50']), nuncaVista), `100 medios y 50 bajos: ${nuncaVista} sale`);

console.log('\n5 · --json y --resumen');
pila(101);
const j = JSON.parse(correr(['5', '--json']).trim().split('\n').pop());
ok(j.primerasCerradas === true && j.abiertosUmbral === 101, `--json: primerasCerradas ${j.primerasCerradas}, abiertosUmbral ${j.abiertosUmbral}`);
ok(/primeras:\s+CERRADAS \(101 /.test(correr(['--resumen'])), '--resumen: «primeras: CERRADAS (101 …»');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
