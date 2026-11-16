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
 *   7. Con cabos de destino `campana` (P003, 01/11/2026) → «en paralelo: /campana <el más
 *      antiguo por fecha> (N abiertas)», sin quitarle el primer puesto a nadie; una cerrada no
 *      cuenta, y sin ninguna abierta la línea no la menciona.
 *   8. EL UMBRAL DE LAS PRIMERAS (16/11/2026): con 101 medios abiertos → 1 /reparar medio y luego
 *      el Inspector; con 100 justos, no. Un alto sigue yendo antes, y los cabos urgentes también.
 *      Con el paso cerrado, la nota de lo que puede esperar habla solo de bajos.
 *   9. Un alto que nombra un cabo de destino usuario o que está reservado por una tanda apartada no
 *      pone /reparar primero (16/11/2026, tras la recogida de las 09:30: 4868 y 4869).
 *
 * Ninguna toca las bases reales: van por `INSPECTOR_DB` y `CABOS_DB`, creadas vacías.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { abrir as abrirCabos, alta, cerrar, codigo } from '../cabos/cabos.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ORDEN = path.join(AQUI, 'orden-del-dia.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'orden-dia-'));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

let n = 0;
let campanaAntigua = null;
/**
 * Bases nuevas para cada caso: `hallazgos` = [[slug, severidad, estado]], `cabos` = { viejos, nuevos, cerradosHoy },
 * `campanas` = [[días de antigüedad, abierta]] en orden de alta; deja en `campanaAntigua` el código de la abierta más vieja
 */
function escenario({ hallazgos = [], cabos = {}, campanas = [], usuario = [], apartados = [] }) {
  n += 1;
  const rutaIns = path.join(TMP, `inspector-${n}.db`);
  const rutaCabos = path.join(TMP, `cabos-${n}.db`);
  // Crea las tablas igual que la base real: abriéndola con db.mjs
  execFileSync(process.execPath, ['-e', `import('./db.mjs').then(m => m.abrir().close())`], { cwd: AQUI, env: { ...process.env, INSPECTOR_DB: rutaIns } });
  const ins = new DatabaseSync(rutaIns);
  for (const [slug, severidad, estado = 'abierto', id = null] of hallazgos) {
    ins.prepare("INSERT INTO hallazgos (id, slug, severidad, descripcion, caso, estado) VALUES (?, ?, ?, 'prueba', 'prueba', ?)").run(id, slug, severidad, estado);
  }
  ins.close();
  const cdb = abrirCabos(rutaCabos);
  const { viejos = 0, nuevos = 0, cerradosHoy = 0 } = cabos;
  const dar = (i, fecha) => alta(cdb, { sujeto: `scripts/prueba-${n}-${i}.mjs`, texto: 'prueba', origen: 'probar-orden', destino: 'reparar', fecha }).id;
  usuario.forEach((texto, i) => alta(cdb, { sujeto: `decision-${n}-${i}`, texto, origen: 'probar-orden', destino: 'usuario' }));
  for (let i = 0; i < viejos; i++) dar(`v${i}`, haceDias(20));
  for (let i = 0; i < nuevos; i++) dar(`n${i}`, haceDias(1));
  for (let i = 0; i < cerradosHoy; i++) cerrar(cdb, dar(`c${i}`, haceDias(20)), { como: 'resuelto', motivo: 'prueba' });
  campanaAntigua = null;
  let diasAntigua = -1;
  campanas.forEach(([dias, abierta = true], i) => {
    const id = alta(cdb, { sujeto: `campana-${n}-${i}`, texto: 'prueba', origen: 'probar-orden', destino: 'campana', fecha: haceDias(dias) }).id;
    if (!abierta) cerrar(cdb, id, { como: 'resuelto', motivo: 'prueba' });
    else if (dias > diasAntigua) { diasAntigua = dias; campanaAntigua = codigo(id); }
  });
  cdb.close();
  // Cada escenario, su propio registro de apartadas: nunca el real
  const rutaApartadas = path.join(TMP, `apartadas-${n}.json`);
  fs.writeFileSync(rutaApartadas, JSON.stringify(apartados.length ? [{ id: 'x', estado: 'abierta', hallazgos: apartados }] : []));
  return execFileSync(process.execPath, [ORDEN], { encoding: 'utf8', env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos, APARTADAS_JSON: rutaApartadas } }).trim();
}
const primero = (linea) => (linea.match(/Orden sugerido: 1 (\/[a-z]+(?: cabos| medio)?)/) ?? [])[1];

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

console.log('\n7 · Las campañas van en paralelo, con la más antigua (P003, 01/11/2026)');
// La más antigua se da de alta DESPUÉS: tiene que ganar por fecha, no por id
l = escenario({ hallazgos: [['app-a', 'bajo']], campanas: [[3], [12], [40, false]] });
ok(l.includes(`· en paralelo: /campana ${campanaAntigua} (2 abiertas)`), `nombra la más antigua y cuenta solo las abiertas («${l.slice(0, 110)}…»)`);
ok(primero(l) === '/inspector', '  no le quita el primer puesto a nadie');
l = escenario({ hallazgos: [['app-alto', 'alto']], campanas: [[5]] });
ok(primero(l) === '/reparar' && l.includes(`en paralelo: /campana ${campanaAntigua} (1 abierta)`), '  con un alto, /reparar primero y la campaña en paralelo, en singular');
l = escenario({ campanas: [[5, false]] });
ok(!l.includes('/campana'), '  sin ninguna abierta no la menciona');

console.log('\n8 · El umbral de las primeras (16/11/2026)');
const medios = (k) => Array.from({ length: k }, (_, i) => [`app-m${i}`, 'medio']);
l = escenario({ hallazgos: [...medios(101), ['app-b', 'bajo']] });
ok(primero(l) === '/reparar medio', `con 101 medios empieza por /reparar medio («${l.slice(0, 90)}…»)`);
ok(/2 \/inspector \(solo cambios y cabos/.test(l), '  y después el Inspector, solo con cambios y cabos');
ok(l.includes('1 bajos abiertos pueden esperar') && !l.includes('bajos y medios'), '  la nota de lo que espera habla solo de bajos');
l = escenario({ hallazgos: medios(100) });
ok(primero(l) === '/inspector', '  con 100 justos, no: empieza por /inspector');
l = escenario({ hallazgos: [...medios(101), ['app-alto', 'alto']] });
ok(/1 \/reparar \(.*2 \/reparar medio \(/.test(l), '  un alto sigue yendo antes');
l = escenario({ hallazgos: medios(101), cabos: { nuevos: 4 } });
ok(/1 \/reparar cabos \(.*2 \/reparar medio \(/.test(l), '  y los cabos urgentes también');

console.log('\n9 · Un alto que espera tu decisión o está apartado no pone /reparar primero (16/11/2026)');
// Con ids de verdad (cuatro cifras): 4868 es el alto de la decisión, 4869 el reservado
l = escenario({ hallazgos: [['app-decision', 'alto', 'abierto', 4868], ['app-apartada', 'alto', 'abierto', 4869], ['app-b', 'bajo']], usuario: ['Hallazgo 4868 (fiscal, nivel 3): espera tu OK'], apartados: [4869] });
ok(primero(l) === '/inspector', `con sus dos altos fuera, empieza por /inspector («${l.slice(0, 70)}…»)`);
ok(l.includes('2 altos esperan tu decisión o están apartados'), '  y lo dice');
l = escenario({ hallazgos: [['app-decision', 'alto', 'abierto', 4879], ['app-libre', 'alto', 'abierto', 4881]], usuario: ['Hallazgos 4879 y 4880: espera tu OK'] });
ok(primero(l) === '/reparar' && l.includes('app-libre') && !/\/reparar \([^)]*app-decision/.test(l), '  un alto libre sigue poniendo /reparar, nombrando solo el suyo');

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
