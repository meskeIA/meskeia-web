#!/usr/bin/env node
/**
 * inspector:probar-precision — que un cierre «con otro esperado» se distinga de un acierto y la
 * precisión del Inspector se pueda contar
 *
 * Ejecutar:  npm run inspector:probar-precision
 *
 * EL CASO DE ORIGEN (01/11/2026, auditoría de los procesos de revisión, punto 5)
 * ─────────────────────────────────────────────────────────────────────────────
 * De 3.907 hallazgos solo 5 se habían descartado (0,13 %), aunque /reparar documenta que el
 * «esperado» del acta falló en 5 de 43 fichas de la ronda del 22/09: cuando el esperado estaba mal
 * se reparaba bien y se cerraba como `arreglado`, y la base no distinguía acierto de corrección.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: un cierre con `--arreglado-otro` queda `arreglado` y con `esperado_errado = 1`.
 *   2. Sin `--motivo`, se niega.
 *   3. `--precision` cuenta aciertos, descartados y otro esperado (1 de 3 → 33,3 %).
 *   4. `--reabrir` lo devuelve a abierto y borra la marca.
 *   5. Cuenta como reparación para `--revalidar-reparadas`, igual que un `--arreglado`.
 *
 * No toca la base real: va por `INSPECTOR_DB`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { RUTA_BASE } from './db.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const CERRAR = path.join(AQUI, 'cerrar.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'precision-'));
const ruta = path.join(TMP, 'inspector.db');
fs.copyFileSync(RUTA_BASE, ruta);

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const cli = (...a) => spawnSync(process.execPath, [CERRAR, ...a], { encoding: 'utf8', env: { ...process.env, INSPECTOR_DB: ruta } });

// Montaje: una app inspeccionada ayer, invalidada después, con tres hallazgos abiertos
let db = new DatabaseSync(ruta);
db.prepare('DELETE FROM hallazgos').run();
db.prepare('DELETE FROM inspecciones').run();
// Las columnas nuevas las añade abrir(): una pasada del CLI migra la copia
db.close();
cli('--precision');
db = new DatabaseSync(ruta);
const slug = db.prepare("SELECT slug FROM apps WHERE usos > 100 ORDER BY usos DESC LIMIT 1").get().slug;
const ayer = new Date(Date.now() - 86_400_000).toISOString();
db.prepare("UPDATE apps SET ultima_inspeccion = ?, validada = ?, hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(ayer.slice(0, 10), ayer, slug);
const { lastInsertRowid: insp } = db.prepare("INSERT INTO inspecciones (slug, fecha, veredicto) VALUES (?, ?, 'con_hallazgos_menores')").run(slug, ayer.slice(0, 10));
const ids = [1, 2, 3].map((n) => Number(db.prepare("INSERT INTO hallazgos (inspeccion_id, slug, tipo, severidad, descripcion, caso, fecha) VALUES (?, ?, 'calculo', 'medio', ?, 'entrada → esperado X · obtenido Y', ?)")
  .run(insp, slug, `hallazgo de prueba ${n}`, ayer.slice(0, 10)).lastInsertRowid));
db.close();

console.log('\n1 · CASO DE ORIGEN: el cierre con otro esperado se distingue de un acierto');
const r1 = cli('--arreglado-otro', String(ids[0]), '--motivo', 'el canónico es 2×2 al 25 %');
db = new DatabaseSync(ruta, { readOnly: true });
const h = db.prepare('SELECT estado, esperado_errado, descripcion FROM hallazgos WHERE id = ?').get(ids[0]);
db.close();
ok(r1.status === 0 && h.estado === 'arreglado' && h.esperado_errado === 1, `${ids[0]}: arreglado, esperado_errado = 1`);
ok(/OTRO ESPERADO: el canónico es 2×2 al 25 %/.test(h.descripcion), '  con el motivo en la descripción');

console.log('\n2 · Sin motivo se niega');
const r2 = cli('--arreglado-otro', String(ids[1]));
ok(r2.status !== 0 && /exige --motivo/.test(r2.stderr), 'acta rechazada sin --motivo');

console.log('\n3 · --precision cuenta los tres cierres');
cli('--arreglado', String(ids[1]));
cli('--descartado', String(ids[2]), '--motivo', 'la app hacía bien');
const p = cli('--precision').stdout;
ok(/33,3 % de 3 cerrados \(1 descartados · 1 con otro esperado\)/.test(p), `«${p.trim()}»`);

console.log('\n4 · --reabrir borra la marca');
cli('--reabrir', String(ids[0]));
db = new DatabaseSync(ruta, { readOnly: true });
const h4 = db.prepare('SELECT estado, esperado_errado, descripcion FROM hallazgos WHERE id = ?').get(ids[0]);
db.close();
ok(h4.estado === 'abierto' && h4.esperado_errado == null && !/OTRO ESPERADO/.test(h4.descripcion), `${ids[0]}: abierto, sin marca ni motivo`);

console.log('\n5 · Cuenta como reparación para --revalidar-reparadas');
cli('--arreglado-otro', String(ids[0]), '--motivo', 'otra vez');
const r5 = cli('--revalidar-reparadas');
ok(new RegExp(`✓ ${slug}`).test(r5.stdout), `${slug} se revalida`);

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
