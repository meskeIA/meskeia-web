#!/usr/bin/env node
/**
 * inspector:probar-cola-valor — que la cola ordene nunca vistas y cambiadas en UNA lista por su
 * valor esperado, que el modo `cambio` traiga su diff y que una comprobación de cabo no revalide
 *
 * Ejecutar:  npm run inspector:probar-cola-valor
 *
 * EL CASO DE ORIGEN (01/11/2026, auditoría de los procesos de revisión)
 * ─────────────────────────────────────────────────────────────────────
 * Los tramos eran estrictos: cualquier INVALIDADA iba antes que cualquier NUEVA. Del 09/10 al 01/11
 * el 92 % de las inspecciones fueron repeticiones enteras (0,16 altos por inspección frente a 0,93
 * de las primeras) mientras 36 apps nunca vistas con más de 100 usos esperaban detrás de 195 del
 * tramo 3; `tabla-integrales` (436 usos) entre ellas. Decidido por el usuario: una lista, por
 * valor = prioridad + 10·log10(tasa · 1000 / segundos) de cada modo, medido en la base.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: una nunca vista de ~400 usos sale por delante de una invalidada de ~1.000.
 *   2. Una nunca vista de poco uso sigue detrás de la invalidada de mucho uso.
 *   3. Dentro de un modo manda la prioridad de siempre.
 *   4. La invalidada sale en modo cambio con su orden `git diff <base> HEAD -- app/<slug>/`.
 *   5. El modo se mide solo: con 10 inspecciones en modo cambio que rinden más, la invalidada pasa
 *      por delante (ningún coste escrito a mano).
 *   6. `registrar` sin modo deduce primera o cambio; con modo `cabo` NO revalida la app.
 *   7. `registrar` rechaza `cabo` en una app nunca vista.
 *   8. Cabo C0633: con `validada` posterior al commit del cambio, la base sale de la huella
 *      inspeccionada y no de la hora; si nada la explica, la cola avisa del diff vacío.
 *
 * Ninguna toca las bases reales: van por `INSPECTOR_DB` y `CABOS_DB`.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { RUTA_BASE } from './db.mjs';
import { FAMILIAS } from './familias.mjs';
import { rutasDeLaApp } from './cambio-familia.mjs';
import { crearHuella } from './huella.mjs';
import { lectorEnElPasado } from './pasado.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const COLA = path.join(AQUI, 'cola.mjs');
const REGISTRAR = path.join(AQUI, 'registrar.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cola-valor-'));
const DE_FAMILIA = new Set(FAMILIAS.flatMap((f) => f.slugs));

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };

// ── Montaje: todo el catálogo visto hace dos meses, sin historial, y cuatro apps elegidas ────
const rutaIns = path.join(TMP, 'inspector.db');
// INSPECTOR_DB si está: en la copia de /reparar la base vive en meskeia-web. Solo se copia
fs.copyFileSync(process.env.INSPECTOR_DB || RUTA_BASE, rutaIns);
let ins = new DatabaseSync(rutaIns);
ins.prepare('DELETE FROM hallazgos').run();
ins.prepare('DELETE FROM inspecciones').run();
ins.prepare("UPDATE apps SET ultima_inspeccion = '2026-08-20', validada = '2026-08-20T10:00:00Z', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde', firma = NULL, firma_desde = NULL").run();

const elegir = (sql) => ins.prepare(sql).all().map((a) => a.slug).find((s) => !DE_FAMILIA.has(s));
const invMucho = elegir("SELECT slug FROM apps WHERE riesgo = 3 AND segmento <> 'contenido' AND usos BETWEEN 800 AND 1500 ORDER BY usos DESC");
const invMenos = elegir(`SELECT slug FROM apps WHERE riesgo = 3 AND segmento <> 'contenido' AND usos BETWEEN 300 AND 600 AND slug <> '${invMucho}' ORDER BY usos DESC`);
const nuevaMucho = elegir(`SELECT slug FROM apps WHERE riesgo = 3 AND segmento <> 'contenido' AND usos BETWEEN 350 AND 500 AND slug NOT IN ('${invMucho}', '${invMenos}') ORDER BY usos DESC`);
const nuevaPoco = elegir("SELECT slug FROM apps WHERE riesgo = 3 AND segmento <> 'contenido' AND usos BETWEEN 1 AND 5 ORDER BY slug");
for (const s of [invMucho, invMenos]) ins.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(s);
for (const s of [nuevaMucho, nuevaPoco]) ins.prepare('UPDATE apps SET ultima_inspeccion = NULL, validada = NULL, hash_inspeccionado = NULL WHERE slug = ?').run(s);
ins.close();
const rutaCabos = path.join(TMP, 'cabos.db');   // vacía: ningún cabo

const env = { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos };
const correr = (args) => execFileSync(process.execPath, [COLA, ...args], { encoding: 'utf8', env, maxBuffer: 16 * 1024 * 1024 });
const pos = (salida, slug) => salida.split('\n').findIndex((l) => new RegExp(`\\s${slug}\\s`).test(l));
const lineaDe = (salida, slug) => salida.split('\n').find((l) => new RegExp(`\\s${slug}\\s`).test(l)) ?? '';

console.log(`\n(nunca vistas: ${nuevaMucho}, ${nuevaPoco} · invalidadas: ${invMucho}, ${invMenos})`);
const cola = correr(['900']);

console.log('\n1 · CASO DE ORIGEN: la nunca vista de uso alto pasa por delante de la invalidada de más uso');
ok(pos(cola, nuevaMucho) >= 0 && pos(cola, nuevaMucho) < pos(cola, invMucho), `${nuevaMucho} antes que ${invMucho}`);

console.log('\n2 · La nunca vista de poco uso sigue detrás');
ok(pos(cola, nuevaPoco) > pos(cola, invMucho), `${nuevaPoco} después de ${invMucho}`);

console.log('\n3 · Dentro de un modo manda la prioridad de siempre');
ok(pos(cola, invMucho) < pos(cola, invMenos), `${invMucho} antes que ${invMenos}`);

console.log('\n4 · La invalidada trae su diff');
ok(new RegExp(`· cambio desde 20/08: git diff [0-9a-f]{8} HEAD -- app/${invMucho}/`).test(lineaDe(cola, invMucho)), `«git diff <base> HEAD -- app/${invMucho}/»`);
ok(/· primera/.test(lineaDe(cola, nuevaMucho)), `  y la nunca vista dice «primera»`);

console.log('\n5 · El modo se mide solo');
{
  const db = new DatabaseSync(rutaIns);
  const hoy = new Date().toISOString().slice(0, 10);
  const otras = db.prepare(`SELECT slug FROM apps WHERE slug NOT IN ('${invMucho}', '${invMenos}', '${nuevaMucho}', '${nuevaPoco}') LIMIT 12`).all();
  for (const { slug } of otras) {
    const { lastInsertRowid } = db.prepare("INSERT INTO inspecciones (slug, fecha, veredicto, segundos, modo) VALUES (?, ?, 'con_hallazgos', 200, 'cambio')").run(slug, hoy);
    db.prepare("INSERT INTO hallazgos (inspeccion_id, slug, severidad, descripcion, caso, fecha) VALUES (?, ?, 'alto', 'prueba', 'prueba', ?)").run(lastInsertRowid, slug, hoy);
  }
  db.close();
  const medida = correr(['900']);
  ok(/cambio 1,00 altos\/insp\. en 200 s \(12, inspecciones en modo cambio\)/.test(medida), 'la cabecera mide el modo cambio con sus 12 inspecciones');
  ok(pos(medida, invMucho) < pos(medida, nuevaMucho), `  y ${invMucho} pasa por delante de ${nuevaMucho}`);
  const db2 = new DatabaseSync(rutaIns);
  db2.prepare("DELETE FROM hallazgos WHERE descripcion = 'prueba'").run();
  db2.prepare("DELETE FROM inspecciones WHERE modo = 'cambio'").run();
  db2.close();
}

console.log('\n6 · registrar: el modo se deduce, y un cabo no revalida');
const registrar = (acta) => {
  const f = path.join(TMP, `acta-${Math.random().toString(36).slice(2)}.json`);
  fs.writeFileSync(f, JSON.stringify(acta));
  return spawnSync(process.execPath, [REGISTRAR, f], { encoding: 'utf8', env });
};
const base = { modelo: 'prueba', segundos: 60, veredicto: 'ok', resumen: 'comprobación de prueba con un caso concreto', hallazgos: [] };
{
  const r1 = registrar({ ...base, slug: nuevaPoco });
  const r2 = registrar({ ...base, slug: invMenos });
  ins = new DatabaseSync(rutaIns, { readOnly: true });
  const modoDe = (s) => ins.prepare('SELECT modo FROM inspecciones WHERE slug = ? ORDER BY id DESC LIMIT 1').get(s)?.modo;
  ok(r1.status === 0 && modoDe(nuevaPoco) === 'primera', `sin modo, ${nuevaPoco} (nunca vista) queda como primera`);
  ok(r2.status === 0 && modoDe(invMenos) === 'cambio', `sin modo, ${invMenos} (ya vista) queda como cambio`);
  const antes = ins.prepare('SELECT ultima_inspeccion, hash_inspeccionado, validada FROM apps WHERE slug = ?').get(invMucho);
  ins.close();
  const r3 = registrar({ ...base, slug: invMucho, modo: 'cabo' });
  ins = new DatabaseSync(rutaIns, { readOnly: true });
  const despues = ins.prepare('SELECT ultima_inspeccion, hash_inspeccionado, validada FROM apps WHERE slug = ?').get(invMucho);
  ok(r3.status === 0 && modoDe(invMucho) === 'cabo', `con modo cabo, ${invMucho} registra la comprobación`);
  ok(JSON.stringify(antes) === JSON.stringify(despues), '  sin tocar su última inspección, su huella ni su validación');
  ins.close();
  ok(/· cambio desde/.test(lineaDe(correr(['900']), invMucho)), '  y su cambio sigue en la cola');
}

console.log('\n7 · registrar rechaza un cabo en una app nunca vista');
{
  const r = registrar({ ...base, slug: nuevaMucho, modo: 'cabo' });
  ok(r.status !== 0 && /nunca inspeccionada/.test(r.stderr), `${nuevaMucho}: acta rechazada`);
}

console.log('\n8 · CASO C0633: con «validada» posterior al commit del cambio, la base es la de ANTES del cambio');
{
  // simulador-planificador-procesos, 04/11/2026: 15136685 (03/11 15:07) era el cambio y su
  // `validada` era posterior, así que la cola imprimía «git diff 15136685 HEAD» y salía vacío.
  // Se reconstruye: huella inspeccionada = la de antes de 15136685 (y de lo que la tocó después),
  // `validada` = ahora. La base tiene que ser el padre de 15136685, y sin aviso de diff vacío.
  const SLUG = 'simulador-planificador-procesos';
  const CAMBIO = '15136685';
  const REPO = path.resolve(AQUI, '..', '..');
  const db = new DatabaseSync(rutaIns);
  const fila = db.prepare('SELECT deps FROM apps WHERE slug = ?').get(SLUG);
  const { carpeta, deps } = rutasDeLaApp(REPO, SLUG, fila?.deps);
  const lista = execFileSync('git', ['-C', REPO, 'log', '--first-parent', '--format=%H', `${CAMBIO}^..HEAD`, '--', carpeta, ...deps], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  const antes = crearHuella({ raiz: REPO, fsv: lectorEnElPasado(REPO, lista).fsv }).analizarApp(SLUG);
  db.prepare('UPDATE apps SET hash_inspeccionado = ?, validada = ? WHERE slug = ?')
    .run(`${antes.hash_codigo}|${antes.hash_deps || ''}`, new Date().toISOString(), SLUG);
  db.close();
  const padre = execFileSync('git', ['-C', REPO, 'rev-parse', '--short=8', `${CAMBIO}^`], { encoding: 'utf8' }).trim();
  const linea = lineaDe(correr(['900']), SLUG);
  ok(linea.includes(`git diff ${padre} HEAD -- app/${SLUG}/`), `«git diff ${padre} HEAD» (el padre de ${CAMBIO}), no la base de «validada»`);
  ok(!/DIFF VACÍO/.test(linea), '  y sin el aviso de diff vacío');
  // Y si ningún commit explica la huella, la cola lo dice en vez de mandar a mirar un diff vacío
  const db2 = new DatabaseSync(rutaIns);
  db2.prepare("UPDATE apps SET hash_inspeccionado = 'ninguno-la-explica' WHERE slug = ?").run(SLUG);
  db2.close();
  ok(/DIFF VACÍO/.test(lineaDe(correr(['900']), SLUG)), '  sin commit que explique la huella: «⚠️ DIFF VACÍO»');
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
