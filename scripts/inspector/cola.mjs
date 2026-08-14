#!/usr/bin/env node
/**
 * inspector:cola — qué apps toca inspeccionar ahora, y por qué
 *
 * Ejecutar:  npm run inspector:cola            (las 10 siguientes)
 *            npm run inspector:cola -- 25
 *            npm run inspector:cola -- --resumen
 *
 * No llama a ningún modelo: es una consulta. La skill `/inspector` empieza leyendo
 * esto, para que la decisión de "qué toca hoy" sea reproducible y auditable en vez de
 * quedar al criterio de lo que el modelo recuerde de la sesión anterior.
 *
 * LAS TRES COLAS, EN ORDEN DE PRIORIDAD
 * ─────────────────────────────────────
 *   1. TEST EN ROJO   — algo que se verificó se ha roto. Es el caso que justifica todo
 *                       esto: `lupa-digital` funcionaba en el móvil del usuario y dejó
 *                       de hacerlo sin que nadie tocara la app.
 *   2. INVALIDADA     — cambió su código o un dato de `data/fiscal` del que depende
 *                       DESPUÉS de inspeccionarla. Lo que rompe una app es un cambio,
 *                       no el paso del tiempo: por eso la cola no va por calendario.
 *   3. NUNCA VISTA    — por prioridad (uso real × riesgo), no por orden alfabético.
 *
 * POR QUÉ EL ORDEN IMPORTA TANTO (medido el 14/08/2026 sobre el dump de Turso)
 * ───────────────────────────────────────────────────────────────────────────
 * El 50 % del uso del catálogo está en 22 apps y el 80 % en 114; hay 410 apps con dos
 * usos o menos en toda su vida. Recorrer las 985 en orden dedicaría el grueso del
 * esfuerzo al 20 % del uso. Con 114 apps se cubre el 80 % de lo que la gente toca.
 */

import { abrir, SQL_INVALIDADA } from './db.mjs';

const args = process.argv.slice(2);
const RESUMEN = args.includes('--resumen');
const CUANTAS = Number(args.find(a => /^\d+$/.test(a))) || 10;

const db = abrir();

/**
 * Prioridad = uso real + riesgo + sospecha de estar rota.
 *
 * El uso entra en logaritmo a propósito: entre 5 y 50 usos hay una diferencia real,
 * entre 900 y 1.200 casi ninguna, y sin log las cuatro apps más visitadas coparían la
 * cola durante semanas.
 *
 * El tercer sumando es el que aporta el caso de lupa-digital: muchas visitas y estancia
 * mínima es la firma de una app en la que se entra y se sale porque no funciona. Como
 * indicio basta para mirarla antes; como prueba no vale nada, y por eso solo ordena.
 */
const PRIORIDAD = `
  (LOG(usos + 1) * 10)
  + ((5 - riesgo) * 5)
  + (CASE WHEN usos >= 50 AND duracion_media > 0 AND duracion_media < 30 THEN 20 ELSE 0 END)
  - (CASE WHEN segmento = 'contenido' THEN 15 ELSE 0 END)
`;

const COLAS = [
  {
    clave: 'ROJO',
    titulo: 'Test en rojo — se ha roto algo que ya estaba verificado',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps WHERE test_estado = 'rojo' ORDER BY p DESC`,
  },
  {
    clave: 'INVALIDADA',
    titulo: 'Invalidada — su código o sus datos han cambiado desde la inspección',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ${SQL_INVALIDADA} ORDER BY p DESC`,
  },
  {
    clave: 'NUEVA',
    titulo: 'Nunca inspeccionada — por uso real y riesgo',
    sql: `SELECT *, ${PRIORIDAD} AS p FROM apps WHERE ultima_inspeccion IS NULL ORDER BY p DESC`,
  },
];

if (RESUMEN) {
  const t = db.prepare('SELECT COUNT(*) n FROM apps').get().n;
  const vistas = db.prepare('SELECT COUNT(*) n FROM apps WHERE ultima_inspeccion IS NOT NULL').get().n;
  const conTest = db.prepare('SELECT COUNT(*) n FROM apps WHERE test_path IS NOT NULL').get().n;
  const abiertos = db.prepare("SELECT COUNT(*) n FROM hallazgos WHERE estado = 'abierto'").get().n;
  console.log(`\nEstado del Inspector`);
  console.log(`  catálogo:        ${t} apps`);
  console.log(`  inspeccionadas:  ${vistas} (${(100 * vistas / t).toFixed(1)} %)`);
  console.log(`  con test propio: ${conTest}`);
  console.log(`  hallazgos abiertos: ${abiertos}`);
  for (const c of COLAS) {
    const n = db.prepare(c.sql.replace('SELECT *,', 'SELECT COUNT(*) AS n,').replace(/ORDER BY p DESC/, '')).get()?.n ?? 0;
    console.log(`  cola ${c.clave.padEnd(11)} ${n}`);
  }
  // Cobertura del uso: la cifra que de verdad dice cuánto se ha protegido
  const total = db.prepare('SELECT SUM(usos) s FROM apps').get().s || 1;
  const cubierto = db.prepare('SELECT SUM(usos) s FROM apps WHERE ultima_inspeccion IS NOT NULL').get().s || 0;
  console.log(`\n  uso del catálogo ya inspeccionado: ${(100 * cubierto / total).toFixed(1)} %`);
  console.log(`  (es la cifra que importa, no el % de apps: el 80 % del uso está en 114 apps)`);
  process.exit(0);
}

let quedan = CUANTAS;
let mostradas = 0;
for (const c of COLAS) {
  if (quedan <= 0) break;
  const filas = db.prepare(c.sql).all().slice(0, quedan);
  if (!filas.length) continue;
  console.log(`\n${c.titulo}`);
  for (const f of filas) {
    const deps = JSON.parse(f.deps || '[]');
    const sospecha = f.usos >= 50 && f.duracion_media > 0 && f.duracion_media < 30;
    console.log(
      `  ${String(Math.round(f.p)).padStart(3)}  ${f.slug.padEnd(38)} ` +
      `${f.segmento.padEnd(11)} riesgo ${f.riesgo}  ${String(f.usos).padStart(5)} usos` +
      (sospecha ? `  ⚠ ${f.duracion_media}s de estancia` : '') +
      (deps.length ? `  [${deps.length} dep]` : ''),
    );
  }
  mostradas += filas.length;
  quedan -= filas.length;
}

if (!mostradas) console.log('\nNada en cola: todo el catálogo está inspeccionado y sin cambios desde entonces.');
else console.log(`\n${mostradas} apps · npm run inspector:cola -- --resumen para el estado global`);
