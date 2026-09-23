#!/usr/bin/env node
/**
 * inspector:probar-familias — que la cola saque las familias JUNTAS, y solo las familias
 *
 * Ejecutar:  npm run inspector:probar-familias
 *
 * Reinyecta el CASO DE ORIGEN sobre una base desechable, que es lo que este proyecto exige
 * a todo candado nuevo: que se le presente el caso del que nació y se compruebe que lo caza.
 *
 * EL CASO DE ORIGEN
 * ─────────────────
 * El 22/09/2026 la cola sacó `simulador-gastos-compraventa-garaje` y
 * `simulador-gastos-compraventa-trastero` SUELTAS, en una tanda de 10 donde no entraron sus
 * otras cinco hermanas. La inspección encontró en el garaje un hueco que estaba abierto
 * también en local-comercial y nave-industrial —con número de línea— y no había forma de
 * cerrarlo sin abrir otra ronda. Ese mismo día se reparó el clúster en lote (`cfe091a7`,
 * «en las SIETE apps») y AUN ASÍ quedaron cuatro huecos, uno de ellos reintroduciendo en
 * local-comercial el mismo defecto de dirección invertida que corregía en trastero.
 *
 * De ahí la regla: si una app es de familia, la cola saca el grupo entero.
 *
 * LAS CUATRO COMPROBACIONES
 * ─────────────────────────
 *   1. Una sola hermana invalidada arrastra a las SIETE.
 *   2. Se imprimen el testigo, la referencia y el invariante — sin eso el bloque no sirve
 *      de nada, porque quien inspeccione no sabrá qué ejecutar ni qué patrón copiar.
 *   3. Una app que NO es de familia sigue saliendo suelta (que no lo agrupe todo).
 *   4. Un slug declarado que ya no exista en el catálogo se DENUNCIA: es el fallo silencioso
 *      clásico de una lista escrita a mano.
 *
 * Ninguna toca `_private/inspector/inspector.db`: van por `INSPECTOR_DB`.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { DatabaseSync } from 'node:sqlite';
import { RUTA_BASE } from './db.mjs';
import { FAMILIAS } from './familias.mjs';

const COLA = path.join(path.dirname(new URL(import.meta.url).pathname.slice(1)), 'cola.mjs');
const FAM = FAMILIAS.find((f) => f.id === 'compraventa');

let fallos = 0;
const ok = (b, msg) => { console.log(`  ${b ? '✓' : '✗'} ${msg}`); if (!b) fallos++; };

/** Copia la base real a una desechable y devuelve su ruta. */
function baseDesechable(nombre) {
  const ruta = path.join(os.tmpdir(), `inspector-prueba-${nombre}-${Date.now()}.db`);
  fs.copyFileSync(RUTA_BASE, ruta);
  return ruta;
}

function correrCola(ruta, args = ['12']) {
  return execFileSync('node', [COLA, ...args], {
    encoding: 'utf8',
    env: { ...process.env, INSPECTOR_DB: ruta },
    maxBuffer: 16 * 1024 * 1024,
  });
}

// ─── 1 y 2 · una hermana invalidada arrastra a las siete, con su cabecera ──────────────
console.log('\n1-2 · Una sola hermana invalidada saca la familia ENTERA, con testigo y referencia');
{
  const ruta = baseDesechable('familia');
  const db = new DatabaseSync(ruta);
  // Todo el catálogo al día, para que solo pueda salir lo que invalidemos a mano.
  db.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde'").run();
  // El caso de origen: SOLO el garaje cambia de código.
  db.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run('simulador-gastos-compraventa-garaje');
  db.close();

  const salida = correrCola(ruta);
  ok(salida.includes('👯 FAMILIA'), 'la cola anuncia el bloque de familia');
  for (const s of FAM.slugs) ok(salida.includes(s), `  arrastra a ${s}`);
  ok(salida.includes(FAM.testigo), 'imprime el testigo que hay que ejecutar');
  ok(salida.includes(FAM.referencia), 'imprime la app de referencia');
  ok(/invariante:/.test(salida), 'imprime el invariante de la familia');
  ok(/1 de 7 pendientes/.test(salida), 'distingue la pendiente de las que están al día');
  fs.unlinkSync(ruta);
}

// ─── 3 · control: una app que no es de familia sale suelta ─────────────────────────────
console.log('\n3 · CONTROL — una app que no es de familia NO se agrupa');
{
  const ruta = baseDesechable('suelta');
  const db = new DatabaseSync(ruta);
  db.prepare("UPDATE apps SET ultima_inspeccion = '2026-09-01', hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, ''), test_estado = 'verde'").run();
  const suelta = db.prepare(
    `SELECT slug FROM apps WHERE slug NOT IN (${FAM.slugs.map(() => '?').join(',')}) AND usos > 100 LIMIT 1`,
  ).get(...FAM.slugs).slug;
  db.prepare("UPDATE apps SET hash_inspeccionado = 'cambiado-a-mano' WHERE slug = ?").run(suelta);
  db.close();

  const salida = correrCola(ruta);
  ok(salida.includes(suelta), `${suelta} sale en la cola`);
  ok(!salida.includes('👯 FAMILIA'), 'y NO se imprime ningún bloque de familia');
  fs.unlinkSync(ruta);
}

// ─── 4 · un slug declarado que ya no existe se denuncia ────────────────────────────────
console.log('\n4 · Un slug declarado que ya no existe en el catálogo se DENUNCIA');
{
  const ruta = baseDesechable('huerfano');
  const db = new DatabaseSync(ruta);
  db.prepare('DELETE FROM apps WHERE slug = ?').run(FAM.slugs[1]);
  db.close();

  const salida = correrCola(ruta, ['--resumen']);
  ok(salida.includes('ya no existen') && salida.includes(FAM.slugs[1]),
     `nombra el slug huérfano (${FAM.slugs[1]})`);
  fs.unlinkSync(ruta);
}

console.log(fallos ? `\n✗ ${fallos} comprobación(es) fallida(s)\n` : '\n✓ La cola agrupa por familia, y solo por familia\n');
process.exit(fallos ? 1 : 0);
