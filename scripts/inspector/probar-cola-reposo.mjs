#!/usr/bin/env node
/**
 * inspector:probar-cola-reposo — que una app cuya última inspección no dejó altos espere un mes
 * antes de volver a la cola por cambio de código, y que lo urgente no espere nunca
 *
 * Ejecutar:  npm run inspector:probar-cola-reposo
 *
 * EL CASO DE ORIGEN (26/10/2026)
 * ──────────────────────────────
 * La familia de compraventa entraba y salía del Inspector casi a diario: cada reparación de un
 * menor cambiaba su código, la dejaba INVALIDADA y la cola la devolvía entera al día siguiente.
 * `estimador-compraventa-inmueble` llevaba 28 inspecciones sin un «ok», la familia se llevaba el
 * 25 % de las inspecciones y en octubre el 92 % eran repeticiones. Decidido por el usuario: los
 * altos se re-inspeccionan en cuanto se reparan; si la última vuelta solo dejó bajos o medios, la
 * app espera un mes. El rojo, la firma y los cabos no esperan. La familia reposa entera o no
 * reposa. Detalle y cifras: «EL REPOSO DE UN MES» en la cabecera de `cola.mjs`.
 *
 * LAS COMPROBACIONES
 * ──────────────────
 *   1. CASO DE ORIGEN: la familia, invalidada entera tras una vuelta de solo menores, NO sale.
 *   2. Si la última vuelta de una sola hermana dejó un alto, la familia sale ENTERA.
 *   3. Una app suelta con menores hace 10 días espera; con menores hace 31 días, sale.
 *   4. Una app con un crítico en su última vuelta sale; una con «ok» hace 5 días espera.
 *   5. Cuenta solo la ÚLTIMA vuelta: un alto anterior ya reparado no la saca.
 *   6. El rojo, la firma y el cabo no esperan, aunque la app esté en reposo.
 *   7. `--resumen` dice cuántas invalidadas esperan en reposo.
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
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cola-reposo-'));
const DE_FAMILIA = new Set(FAMILIAS.flatMap((f) => f.slugs));
const FAM = FAMILIAS.find((f) => f.id === 'compraventa');

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };
const haceDias = (n) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);

// ── Montaje: todo el catálogo al día y sin historial; cada caso escribe el suyo ─────────────
const rutaIns = path.join(TMP, 'inspector.db');
fs.copyFileSync(RUTA_BASE, rutaIns);
const ins = new DatabaseSync(rutaIns);
ins.prepare('DELETE FROM hallazgos').run();
ins.prepare('DELETE FROM inspecciones').run();
ins.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde', firma = NULL, firma_desde = NULL").run();

/** Una vuelta del Inspector hace `dias` días, con hallazgos de esas severidades. */
function vuelta(slug, dias, severidades) {
  const fecha = haceDias(dias);
  const { lastInsertRowid: id } = ins.prepare("INSERT INTO inspecciones (slug, fecha, veredicto) VALUES (?, ?, 'prueba')").run(slug, fecha);
  for (const s of severidades) {
    ins.prepare("INSERT INTO hallazgos (inspeccion_id, slug, severidad, descripcion, caso, fecha) VALUES (?, ?, ?, 'prueba', 'prueba', ?)").run(id, slug, s, fecha);
  }
  ins.prepare('UPDATE apps SET ultima_inspeccion = ? WHERE slug = ?').run(fecha, slug);
}
const invalidar = (slug) => ins.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(slug);

const [menores10, menores31, critico, sinHallazgos, altoAnterior, rojo, firma, cabo] = ins
  .prepare("SELECT slug FROM apps WHERE usos > 50 ORDER BY usos DESC").all()
  .map((a) => a.slug).filter((s) => !DE_FAMILIA.has(s));

for (const s of FAM.slugs) { vuelta(s, 0, ['medio', 'bajo']); invalidar(s); }
vuelta(menores10, 10, ['bajo', 'medio']); invalidar(menores10);
vuelta(menores31, 31, ['bajo']); invalidar(menores31);
vuelta(critico, 5, ['critico']); invalidar(critico);
vuelta(sinHallazgos, 5, []); invalidar(sinHallazgos);
vuelta(altoAnterior, 20, ['alto']); vuelta(altoAnterior, 3, ['bajo']); invalidar(altoAnterior);
for (const s of [rojo, firma, cabo]) { vuelta(s, 5, ['bajo']); invalidar(s); }
ins.prepare("UPDATE apps SET test_estado = 'rojo' WHERE slug = ?").run(rojo);
ins.prepare("UPDATE apps SET firma = 'nivel', firma_detalle = 'prueba', firma_desde = ? WHERE slug = ?").run(haceDias(0), firma);

const rutaCabos = path.join(TMP, 'cabos.db');
const cdb = abrirCabos(rutaCabos);
alta(cdb, { sujeto: cabo, texto: 'sospecha de prueba', origen: 'probar-cola-reposo', destino: 'inspector' });
cdb.close();

const correr = (args) => execFileSync(process.execPath, [COLA, ...args], {
  encoding: 'utf8',
  env: { ...process.env, INSPECTOR_DB: rutaIns, CABOS_DB: rutaCabos },
  maxBuffer: 16 * 1024 * 1024,
});
const sale = (salida, slug) => salida.split('\n').some((l) => new RegExp(`\\s${slug}\\s`).test(l));
const tramoDe = (salida, titulo) => (salida.split(/\n(?=\S)/).find((b) => b.startsWith(titulo)) ?? '');

console.log('\n1 · CASO DE ORIGEN: la familia, invalidada tras una vuelta de solo menores, no sale');
ins.close();
let cola = correr(['400']);
ok(!cola.includes(`FAMILIA «${FAM.nombre}»`), `la familia «${FAM.nombre}» espera`);
ok(FAM.slugs.every((s) => !sale(cola, s)), '  ninguna hermana sale suelta');

console.log('\n2 · Un alto en la última vuelta de una sola hermana saca la familia entera');
{
  const db = new DatabaseSync(rutaIns);
  const { lastInsertRowid: id } = db.prepare("INSERT INTO inspecciones (slug, fecha, veredicto) VALUES (?, ?, 'prueba')").run(FAM.slugs[0], haceDias(0));
  db.prepare("INSERT INTO hallazgos (inspeccion_id, slug, severidad, descripcion, caso, fecha) VALUES (?, ?, 'alto', 'prueba', 'prueba', ?)").run(id, FAM.slugs[0], haceDias(0));
  db.close();
  cola = correr(['400']);
  ok(cola.includes(`FAMILIA «${FAM.nombre}»`), `la familia sale por el alto de ${FAM.slugs[0]}`);
  ok(cola.includes(`(${FAM.slugs.length} de ${FAM.slugs.length} pendientes)`), `  con las ${FAM.slugs.length} hermanas pendientes, no solo la del alto`);
}

console.log('\n3 · Una app con menores espera un mes, no más');
ok(!sale(cola, menores10), `${menores10} (menores hace 10 días) espera`);
ok(sale(cola, menores31), `${menores31} (menores hace 31 días) sale`);

console.log('\n4 · Un crítico no espera; un «ok» sí');
ok(sale(cola, critico), `${critico} (crítico hace 5 días) sale`);
ok(!sale(cola, sinHallazgos), `${sinHallazgos} (sin hallazgos hace 5 días) espera`);

console.log('\n5 · Cuenta solo la última vuelta');
ok(!sale(cola, altoAnterior), `${altoAnterior} (alto hace 20 días, solo bajos hace 3) espera`);

console.log('\n6 · El rojo, la firma y el cabo no esperan');
ok(sale(tramoDe(cola, 'Test en rojo'), rojo), `${rojo} sale en el tramo del rojo`);
ok(sale(tramoDe(cola, 'Firma de rotura'), firma), `${firma} sale en el tramo de la firma`);
ok(sale(cola, cabo) && cola.includes('· cabo C'), `${cabo} sale por su cabo`);

console.log('\n7 · --resumen cuenta las que esperan');
const m = correr(['--resumen']).match(/en reposo:\s+(\d+) invalidadas/);
// menores10, sinHallazgos, altoAnterior y las tres que no esperan (reposan, pero salen igual)
ok(m && Number(m[1]) === 6, `imprime «en reposo: 6 invalidadas» (sale ${m ? m[1] : 'nada'})`);

fs.rmSync(TMP, { recursive: true, force: true });
console.log(fallos ? `\n✗ ${fallos} comprobaciones FALLAN` : '\n✓ todas las comprobaciones pasan');
process.exit(fallos ? 1 : 0);
