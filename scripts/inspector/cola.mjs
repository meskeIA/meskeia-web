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
 * LAS FAMILIAS SALEN JUNTAS
 * ─────────────────────────
 * Si una app pertenece a una familia declarada en `familias.mjs`, la cola saca el grupo
 * ENTERO y no la app suelta. Sale de haber medido (23/09/2026) que reparar en lote no
 * cierra el problema: el commit `cfe091a7` reparó el clúster de compraventa «en las SIETE
 * apps» y aun así dejó cuatro huecos, uno de ellos reintroduciendo en una hermana el mismo
 * defecto que corregía en otra. Verlas de una en una, con meses de separación, es lo que
 * hace que eso no se detecte. El detalle, en la cabecera de `familias.mjs`.
 *
 * POR QUÉ EL ORDEN IMPORTA TANTO (medido el 14/08/2026 sobre el dump de Turso)
 * ───────────────────────────────────────────────────────────────────────────
 * El 50 % del uso del catálogo está en 22 apps y el 80 % en 114; hay 410 apps con dos
 * usos o menos en toda su vida. Recorrer las 985 en orden dedicaría el grueso del
 * esfuerzo al 20 % del uso. Con 114 apps se cubre el 80 % de lo que la gente toca.
 */

import { abrir, SQL_INVALIDADA } from './db.mjs';
import { FAMILIAS, familiaDe, slugsHuerfanos } from './familias.mjs';

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

  const huerf = slugsHuerfanos(db);
  console.log(`\n  familias declaradas: ${FAMILIAS.length} (salen JUNTAS de la cola)`);
  for (const f of FAMILIAS) {
    const pend = f.slugs.filter((s) => {
      const r = db.prepare(
        `SELECT 1 x FROM apps WHERE slug = ? AND (test_estado = 'rojo' OR ${SQL_INVALIDADA} OR ultima_inspeccion IS NULL)`,
      ).get(s);
      return !!r;
    }).length;
    console.log(`    ${f.id.padEnd(14)} ${f.slugs.length} apps · ${pend} pendientes · ${f.testigo}`);
  }
  if (huerf.length) {
    console.log(`  ⚠ ${huerf.length} slug(s) declarados que ya no existen — corrige familias.mjs:`);
    for (const h of huerf) console.log(`      ${h.familia} → ${h.slug}`);
  }
  process.exit(0);
}

/** Una línea de app, con su prioridad, uso y avisos. */
function linea(f, sangria = '  ') {
  const deps = JSON.parse(f.deps || '[]');
  const sospecha = f.usos >= 50 && f.duracion_media > 0 && f.duracion_media < 30;
  return (
    `${sangria}${String(Math.round(f.p)).padStart(3)}  ${f.slug.padEnd(44)} ` +
    `${f.segmento.padEnd(11)} riesgo ${f.riesgo}  ${String(f.usos).padStart(5)} usos` +
    (sospecha ? `  ⚠ ${f.duracion_media}s de estancia` : '') +
    (deps.length ? `  [${deps.length} dep]` : '')
  );
}

/** En qué cola está un slug ahora mismo, o null si está al día. */
const SQL_ESTADO = db.prepare(`
  SELECT slug, ${PRIORIDAD} AS p, segmento, riesgo, usos, duracion_media, deps, ultima_inspeccion,
         CASE WHEN test_estado = 'rojo' THEN 'ROJO'
              WHEN ${SQL_INVALIDADA} THEN 'INVALIDADA'
              WHEN ultima_inspeccion IS NULL THEN 'NUEVA'
              ELSE 'al día' END AS estado
  FROM apps WHERE slug = ?`);

const huerfanos = slugsHuerfanos(db);
if (huerfanos.length) {
  console.log('\n⚠ Familias con slugs que ya no existen en el catálogo (corrige familias.mjs):');
  for (const h of huerfanos) console.log(`    ${h.familia} → ${h.slug}`);
}

let quedan = CUANTAS;
let mostradas = 0;
const familiasYaSacadas = new Set();

for (const c of COLAS) {
  if (quedan <= 0) break;
  const todas = db.prepare(c.sql).all();
  const elegidas = [];

  for (const f of todas) {
    if (quedan <= 0) break;
    const fam = familiaDe(f.slug);

    if (!fam) {
      elegidas.push({ tipo: 'app', fila: f });
      quedan -= 1;
      continue;
    }
    if (familiasYaSacadas.has(fam.id)) continue;   // ya salió entera más arriba

    // La familia sale ENTERA: las que están pendientes cuentan contra el cupo; las que
    // están al día se listan como contexto, porque el testigo las mide igualmente.
    const miembros = fam.slugs.map((s) => SQL_ESTADO.get(s)).filter(Boolean);
    elegidas.push({ tipo: 'familia', familia: fam, miembros });
    familiasYaSacadas.add(fam.id);
    quedan -= miembros.filter((m) => m.estado !== 'al día').length;
  }

  if (!elegidas.length) continue;
  console.log(`\n${c.titulo}`);

  for (const e of elegidas) {
    if (e.tipo === 'app') {
      console.log(linea(e.fila));
      mostradas += 1;
      continue;
    }
    const pendientes = e.miembros.filter((m) => m.estado !== 'al día').length;
    console.log(`\n  👯 FAMILIA «${e.familia.nombre}» — se inspeccionan JUNTAS ` +
                `(${pendientes} de ${e.miembros.length} pendientes)`);
    console.log(`     testigo:    ${e.familia.testigo}`);
    console.log(`     referencia: ${e.familia.referencia} — el patrón correcto, no rediseñar`);
    console.log(`     invariante: ${e.familia.invariante}`);
    for (const m of e.miembros) {
      console.log(linea(m, '      ') + `  · ${m.estado}`);
    }
    mostradas += pendientes;
  }
}

if (!mostradas) console.log('\nNada en cola: todo el catálogo está inspeccionado y sin cambios desde entonces.');
else console.log(`\n${mostradas} apps · npm run inspector:cola -- --resumen para el estado global`);
