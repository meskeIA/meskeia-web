#!/usr/bin/env node
/**
 * inspector:probar-orden — que la línea «Orden sugerido» de /parte aplique la regla del 26/10/2026
 *
 * Ejecutar:  npm run inspector:probar-orden
 *
 * EL CASO DE ORIGEN (26/10/2026)
 * ──────────────────────────────
 * Con /inspector, /reparar y /reparar cabos ya hechos, el usuario no sabía cuál le convenía si
 * lanzaba otro: el parte los ponía en «Te toca hoy» sin orden. Ese día había 0 altos abiertos y
 * los cabos técnicos se vaciaban (84 → 95 en 7 días): tocaba /inspector. La regla, en la cabecera
 * de `orden-del-dia.mjs`.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: sin altos y con los cabos vaciándose → 1 /inspector; cabos y menores esperan.
 *   2. Un solo alto abierto → 1 /reparar, con la app nombrada. Un crítico cuenta igual.
 *   3. Un alto ya arreglado no cuenta.
 *   4. Sin altos, con la bandeja de cabos creciendo en la semana → 1 /reparar cabos.
 *   5. Sin altos, sin crecer, pero con más de 30 cabos → 1 /reparar cabos.
 *   6. Con un alto y los cabos creciendo → /reparar, luego /reparar cabos, luego /inspector.
 *
 * Ninguna toca las bases reales: van por `INSPECTOR_DB` y `CABOS_DB`, creadas vacías.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { abrir as abrirCabos, alta, cerrar } from '../cabos/cabos.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORDEN = path.join(AQUI, 'orden-del-dia.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'orden-dia-'));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

let n = 0;
/** Bases nuevas para cada caso: `hallazgos` = [[slug, severidad, estado]], `cabos` = { viejos, nuevos, cerradosHoy } */
function escenario({ hallazgos = [], cabos = {} }) {
  n += 1;
  const rutaIns = path.join(TMP, `inspector-${n}.db`);
  const rutaCabos = path.join(TMP, `cabos-${n}.db`);
  // Crea las tablas igual que la base real: abriéndola con db.mjs
  execFileSync(process.execPath, ['-e', `import('./db.mjs').then(m => m.abrir().close())`], { cwd: AQUI, env: { ...process.env, INSPECTOR_DB: rutaIns } });
  const ins = new DatabaseSync(rutaIns);
  for (const [slug, severidad, estado = 'abierto'] of hallazgos) {
    ins.prepare("INSERT INTO hallazgos (slug, severidad, descripcion, caso, estado) VALUES (?, ?, 'prueba', 'prueba', ?)").run(slug, severidad, estado);
  }
  ins.close();
  const cdb = abrirCabos(rutaCabos);
  const { viejos = 0, nuevos = 0, cerradosHoy = 0 } = cabos;
  const dar = (i, fecha) => alta(cdb, { sujeto: `scripts/prueba-${n}-${i}.mjs`, texto: 'prueba', origen: 'probar-orden', destino: 'reparar', fecha }).id;
  for (let i = 0; i < viejos; i++) dar(`v${i}`, haceDias(20));
  for (let i = 0; i < nuevos; i++) dar(`n${i}`, haceDias(1));
  for (let i = 0; i < cerradosHoy; i++) cerrar(cdb, dar(`c${i}`, haceDias(20)), { como: 'resuelto', motivo: 'prueba' });
  cdb.close();
  return execFileSync(process.execPath, [ORDEN], { encoding: 'utf8', env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos } }).trim();
}
const primero = (linea) => (linea.match(/Orden sugerido: 1 (\/[a-z]+(?: cabos)?)/) ?? [])[1];

console.log('\n1 · CASO DE ORIGEN: sin altos y con los cabos vaciándose, primero el Inspector');
let l = escenario({ hallazgos: [['app-a', 'bajo'], ['app-b', 'medio']], cabos: { viejos: 17, nuevos: 2, cerradosHoy: 5 } });
ok(primero(l) === '/inspector', `empieza por /inspector («${l.slice(0, 60)}…»)`);
ok(l.includes('/reparar cabos puede esperar'), '  dice que los cabos técnicos pueden esperar');
ok(l.includes('2 bajos y medios abiertos pueden esperar'), '  y que los menores también');

console.log('\n2 · Un solo alto abierto pone /reparar primero');
l = escenario({ hallazgos: [['app-alto', 'alto'], ['app-b', 'bajo']] });
ok(primero(l) === '/reparar', 'empieza por /reparar');
ok(l.includes('app-alto'), '  nombra la app del alto');
l = escenario({ hallazgos: [['app-critica', 'critico']] });
ok(primero(l) === '/reparar', 'un crítico cuenta igual');

console.log('\n3 · Un alto ya arreglado no cuenta');
l = escenario({ hallazgos: [['app-alto', 'alto', 'arreglado']] });
ok(primero(l) === '/inspector', 'empieza por /inspector');

console.log('\n4 · Sin altos, la bandeja de cabos creciendo en la semana se adelanta');
l = escenario({ cabos: { viejos: 3, nuevos: 6, cerradosHoy: 2 } });
ok(primero(l) === '/reparar cabos', `empieza por /reparar cabos («${l.slice(0, 70)}…»)`);
ok(l.includes('la bandeja crece'), '  y dice por qué');

console.log('\n5 · Sin altos ni crecimiento, pero con más de 30 cabos');
l = escenario({ cabos: { viejos: 31 } });
ok(primero(l) === '/reparar cabos', 'empieza por /reparar cabos');
l = escenario({ cabos: { viejos: 30 } });
ok(primero(l) === '/inspector', '  con 30 justos, no: empieza por /inspector');

console.log('\n6 · Un alto y los cabos creciendo: reparar, cabos, inspector');
l = escenario({ hallazgos: [['app-alto', 'alto']], cabos: { nuevos: 4 } });
ok(/1 \/reparar \(.*2 \/reparar cabos \(.*3 \/inspector/.test(l), 'en ese orden');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
