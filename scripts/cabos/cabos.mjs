#!/usr/bin/env node
/**
 * cabos — la entrada única de los cabos de Claude en meskeIA
 *
 * Ejecutar:  node scripts/cabos/cabos.mjs <orden> [opciones]      (o `npm run -s cabos -- …`)
 *
 *   alta --sujeto S --origen O --texto T [--destino D]   da de alta un cabo
 *   alta --json <fichero>                                 uno o varios ({sujeto, origen, texto, destino?, fecha?})
 *   lista [--sin-clasificar | --destino D | --sujeto S | --todos] [--completo] [--json]
 *   ver <id>                                              el cabo entero, con sus movimientos
 *   resumen [--json]                                      cuántos hay abiertos, por destino
 *   clasificar <id> <destino> [--nota N]                  lo asigna a quien lo va a consumir
 *   nota <id> --texto T                                   sigue abierto: por qué, o qué se averiguó
 *   cerrar <id> --como resuelto|descartado|duplicado|enviado [--motivo M] [--ref R]
 *
 * Para escribir, mejor `node` directo que `npm run`: npm lanza los scripts con cmd.exe en
 * Windows, y cmd se come los `%` de un texto («0,75 %»). Un texto largo, por `--json`.
 *
 * ── Qué es un cabo ────────────────────────────────────────────────────────────
 * Lo que aparece en una conversación y no se resuelve en ella: una sospecha sin caso, una
 * mejora técnica para otra sesión, algo que hay que dejar madurar unos días, un dato que pide
 * su fuente, una decisión que no es de Claude. Lo que YA tiene sitio claro no pasa por aquí:
 *
 *   defecto con caso (entrada → esperado → obtenido) → hallazgo en `inspector.db`
 *   algo con fecha                                  → `agenda.json` (fuente única del cuándo)
 *   idea de app o de producto                       → la semilla (`semillas/log.jsonl`)
 *   lo aprendido (un hecho, una regla)              → la memoria
 *
 * Esta entrada es para lo demás, y para la DUDA: si no está claro adónde va, viene aquí.
 *
 * ── De dónde sale (08/10/2026) ────────────────────────────────────────────────
 * Hasta hoy había que decidir el destino de un cabo AL ESCRIBIRLO, y para saber el destino
 * hay que saber ya cómo se resolverá: justo lo que no se sabe cuando aparece. El usuario no
 * sabía qué indicar al pedir que se anotara algo, y Claude había tenido que corregirse varias
 * veces. Medido ese día:
 *
 *   - `_private/inspector/SOSPECHAS.md` hacía de bandeja de «no sé dónde va»: 164 líneas en
 *     15 días (~11 al día). 105 NO eran de ninguna app —herramientas, candados, tests,
 *     familias, configuración— aunque su único lector, el Inspector, trabaja por apps. 24
 *     decían «CON CASO», que por su propia regla eran hallazgos. 15 apps con 2-3 líneas sueltas.
 *   - No estaba en git y la línea se borraba al consumirse: no había forma de saber si la
 *     bandeja se vaciaba o solo crecía.
 *   - La §5 del BACKLOG («Tareas abiertas») recibía la misma clase de cosas por otra puerta,
 *     y solo la leía `/audit-meskeia` una vez por semana.
 *
 * Tres bandejas, en cambio, funcionaban sin confusión —hallazgos, semilla y Agenda— porque
 * cada una tiene una identidad clara, un formato fijo, un estado y un ritual que la vacía.
 * La idea viene de cómo un ERP evita los desajustes entre departamentos:
 *
 *   1. UNA SOLA PUERTA DE ENTRADA; clasificar es trabajo de quien CONSUME, no de quien
 *      escribe. Quien escribe puede dar el destino si lo sabe; si duda, lo deja vacío, y no
 *      pasa nada.
 *   2. NADA SE BORRA: se cierra, con cómo y por qué. Cada cambio deja un movimiento.
 *   3. NINGÚN DESTINO SIN CONSUMIDOR. Cada destino nombra el ritual que lo vacía, y
 *      `probar-cabos.mjs` comprueba que esa skill lo lee de verdad.
 *
 * Precedente del mismo remedio: el 29/07/2026 había dos listas de ideas que no se veían
 * (§7 del BACKLOG y la semilla) y se dejaron en un solo `log.jsonl` con estado.
 *
 * ── Dónde vive ────────────────────────────────────────────────────────────────
 * `_private/cabos/cabos.db` (fuera de git; la copia crítica diaria se lleva todo lo que está en
 * `.gitignore`, así que va en el backup sin tocar nada). `node:sqlite`, sin dependencias, como
 * la base del Inspector. Las pruebas van por `CABOS_DB` y nunca tocan la real.
 */

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const RUTA_BASE = path.join(RAIZ, '_private', 'cabos', 'cabos.db');

/**
 * Los destinos, cada uno con el ritual que lo vacía (principio 3). `probar-cabos.mjs` exige
 * que la skill de cada consumidor contenga `--destino <destino>`: un destino que nadie lee es
 * exactamente la bandeja-cementerio que esto vino a cerrar.
 */
export const DESTINOS = {
  inspector: {
    consumidor: 'inspector',
    que: 'sospecha sobre una app o una familia de apps, todavía sin caso: la adelanta en la cola y la convierte en hallazgo o la descarta',
  },
  fiscal: {
    consumidor: 'triaje-fiscal',
    que: 'dato normativo (data/fiscal, data/itp-ccaa…) que exige fuente oficial y el OK del usuario',
  },
  reparar: {
    consumidor: 'reparar',
    que: 'trabajo técnico ya entendido que no es de una app: herramienta, test inestable, candado candidato, configuración',
  },
  usuario: {
    consumidor: 'parte',
    que: 'decisión que no es de Claude (el qué: publicar, retirar, prometer, neutralidad editorial)',
  },
};

export const CIERRES = ['resuelto', 'descartado', 'duplicado', 'enviado'];

/** Las bandejas a las que un cabo puede ENVIARSE al cerrarse, con la forma de su referencia. */
export const BANDEJAS = {
  hallazgo: /^\d+$/,              // nº en inspector.db
  agenda: /^[a-z0-9][a-z0-9-]*$/, // id de agenda.json
  semilla: /^S\d{4}$/,            // id de la semilla
  memoria: /^[a-z0-9_]+$/,        // nombre de la ficha
};

const TABLAS = [
  `CREATE TABLE IF NOT EXISTS cabos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha     TEXT NOT NULL,      -- AAAA-MM-DD, el día en que se vio
    sujeto    TEXT NOT NULL,      -- slug, ruta o familia
    texto     TEXT NOT NULL,      -- qué se vio
    origen    TEXT NOT NULL,      -- qué sesión lo deja
    destino   TEXT,               -- NULL = sin clasificar
    estado    TEXT NOT NULL DEFAULT 'abierto',   -- abierto | cerrado
    cierre    TEXT,               -- resuelto | descartado | duplicado | enviado
    motivo    TEXT,
    ref       TEXT,               -- hallazgo:N · agenda:id · semilla:S0000 · memoria:ficha · C0000 · sha
    cerrado   TEXT                -- ISO
  )`,
  `CREATE TABLE IF NOT EXISTS movimientos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    cabo      INTEGER NOT NULL REFERENCES cabos(id),
    momento   TEXT NOT NULL,      -- ISO
    accion    TEXT NOT NULL,      -- alta | clasificar | nota | cerrar
    detalle   TEXT
  )`,
];

export function abrir(ruta = process.env.CABOS_DB || RUTA_BASE) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const db = new DatabaseSync(ruta);
  // Esperar y no fallar si otro proceso está escribiendo: el Inspector de la tarea de Windows
  // (copia aparte, 09/10/2026) anota y cierra cabos mientras otras conversaciones también anotan.
  db.prepare('PRAGMA busy_timeout = 5000').run();
  for (const t of TABLAS) db.prepare(t).run();
  return db;
}

// ── utilidades ──────────────────────────────────────────────────────────────

export const codigo = (id) => `C${String(id).padStart(4, '0')}`;

export function leerId(texto) {
  const m = String(texto ?? '').trim().match(/^c?0*(\d+)$/i);
  if (!m) throw new Error(`«${texto}» no es un número de cabo (C0012, c12 o 12)`);
  return Number(m[1]);
}

const hoyISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const fechaES = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');

const diasDesde = (iso) => Math.round((Date.parse(hoyISO()) - Date.parse(iso.slice(0, 10))) / 86_400_000);

function movimiento(db, cabo, accion, detalle = null) {
  db.prepare('INSERT INTO movimientos (cabo, momento, accion, detalle) VALUES (?, ?, ?, ?)')
    .run(cabo, new Date().toISOString(), accion, detalle);
}

function obtener(db, id) {
  const fila = db.prepare('SELECT * FROM cabos WHERE id = ?').get(id);
  if (!fila) throw new Error(`no existe el cabo ${codigo(id)}`);
  return fila;
}

function exigirAbierto(fila) {
  if (fila.estado !== 'abierto') {
    throw new Error(`${codigo(fila.id)} ya está cerrado (${fila.cierre}${fila.ref ? ` → ${fila.ref}` : ''}): si vuelve a aparecer, da de alta otro que lo cite`);
  }
}

function exigirDestino(destino) {
  if (!Object.hasOwn(DESTINOS, destino)) {
    throw new Error(`destino «${destino}» desconocido; los válidos: ${Object.keys(DESTINOS).join(', ')}`);
  }
}

/**
 * Palabras del sujeto que sirven para encontrar cabos parecidos. Las genéricas se quitan:
 * «familia» o «tests» emparejarían medio fichero.
 */
const GENERICAS = new Set(['familia', 'fuera', 'tests', 'scripts', 'components', 'compartido', 'inspeccionadas', 'herramienta', 'candado', 'app', 'apps']);
function palabrasDe(sujeto) {
  return [...new Set(sujeto.toLowerCase().split(/[\s,·()]+/).filter((p) => p.length >= 5 && !GENERICAS.has(p)))];
}

// ── órdenes ─────────────────────────────────────────────────────────────────

/**
 * Da de alta un cabo. Devuelve su id y los abiertos con un sujeto parecido: no bloquea, porque
 * dos cabos de la misma app pueden ser cosas distintas, pero quien escribe tiene que verlos.
 */
export function alta(db, { sujeto, texto, origen, destino = null, fecha = null }) {
  for (const [campo, valor] of Object.entries({ sujeto, texto, origen })) {
    if (!valor || !String(valor).trim()) throw new Error(`falta «${campo}»: sin él, el cabo no se puede ni encontrar ni juzgar`);
  }
  if (destino !== null && destino !== undefined && destino !== '') exigirDestino(destino);
  else destino = null;
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error(`fecha «${fecha}» no es AAAA-MM-DD`);

  const parecidos = [];
  for (const palabra of palabrasDe(sujeto)) {
    for (const f of db.prepare("SELECT id, sujeto FROM cabos WHERE estado = 'abierto' AND lower(sujeto) LIKE ?").all(`%${palabra}%`)) {
      if (!parecidos.some((p) => p.id === f.id)) parecidos.push(f);
    }
  }

  const r = db.prepare('INSERT INTO cabos (fecha, sujeto, texto, origen, destino) VALUES (?, ?, ?, ?, ?)')
    .run(fecha || hoyISO(), sujeto.trim(), texto.trim(), origen.trim(), destino);
  const id = Number(r.lastInsertRowid);
  movimiento(db, id, 'alta', destino ? `destino: ${destino}` : 'sin clasificar');
  return { id, parecidos };
}

export function listar(db, { todos = false, sinClasificar = false, destino = null, sujeto = null } = {}) {
  const donde = [];
  const args = [];
  if (!todos) donde.push("estado = 'abierto'");
  if (sinClasificar) donde.push('destino IS NULL');
  if (destino) { exigirDestino(destino); donde.push('destino = ?'); args.push(destino); }
  if (sujeto) { donde.push('(lower(sujeto) LIKE ? OR lower(texto) LIKE ?)'); args.push(`%${sujeto.toLowerCase()}%`, `%${sujeto.toLowerCase()}%`); }
  const sql = `SELECT * FROM cabos ${donde.length ? `WHERE ${donde.join(' AND ')}` : ''} ORDER BY fecha, id`;
  return db.prepare(sql).all(...args);
}

export function movimientosDe(db, id) {
  return db.prepare('SELECT * FROM movimientos WHERE cabo = ? ORDER BY id').all(id);
}

export function clasificar(db, id, destino, nota = null) {
  exigirDestino(destino);
  const fila = obtener(db, id);
  exigirAbierto(fila);
  db.prepare('UPDATE cabos SET destino = ? WHERE id = ?').run(destino, id);
  movimiento(db, id, 'clasificar', `${fila.destino ?? 'sin clasificar'} → ${destino}${nota ? ` · ${nota}` : ''}`);
}

export function anotar(db, id, texto) {
  if (!texto || !texto.trim()) throw new Error('la nota está vacía');
  exigirAbierto(obtener(db, id));
  movimiento(db, id, 'nota', texto.trim());
}

/**
 * Cierra un cabo. Las reglas que se hacen cumplir aquí son las que dejan el cierre
 * comprobable después: un «enviado» sin la referencia de dónde quedó es un cabo perdido
 * con otro nombre, y un «descartado» sin motivo no deja juzgar si se descartó bien.
 */
export function cerrar(db, id, { como, motivo = null, ref = null }) {
  if (!CIERRES.includes(como)) throw new Error(`cierre «${como}» desconocido; los válidos: ${CIERRES.join(', ')}`);
  const fila = obtener(db, id);
  exigirAbierto(fila);

  if (como === 'enviado') {
    const m = String(ref ?? '').match(/^([a-z]+):(.+)$/);
    if (!m || !BANDEJAS[m[1]]) throw new Error(`«enviado» exige --ref con su bandeja: ${Object.keys(BANDEJAS).map((b) => `${b}:…`).join(' · ')}`);
    if (!BANDEJAS[m[1]].test(m[2])) throw new Error(`la referencia «${ref}» no tiene la forma de ${m[1]}`);
  } else if (como === 'duplicado') {
    const otro = leerId(ref);
    if (otro === id) throw new Error('un cabo no puede ser duplicado de sí mismo');
    obtener(db, otro);
    ref = codigo(otro);
  } else if (!motivo || !motivo.trim()) {
    throw new Error(`«${como}» exige --motivo: qué lo resolvió o por qué se descarta`);
  }

  db.prepare("UPDATE cabos SET estado = 'cerrado', cierre = ?, motivo = ?, ref = ?, cerrado = ? WHERE id = ?")
    .run(como, motivo?.trim() || null, ref, new Date().toISOString(), id);
  movimiento(db, id, 'cerrar', [como, ref, motivo?.trim()].filter(Boolean).join(' · '));
}

export function resumen(db) {
  const abiertos = db.prepare("SELECT * FROM cabos WHERE estado = 'abierto' ORDER BY fecha, id").all();
  const porDestino = Object.fromEntries(Object.keys(DESTINOS).map((d) => [d, 0]));
  let sinClasificar = 0;
  for (const c of abiertos) {
    if (c.destino) porDestino[c.destino] += 1;
    else sinClasificar += 1;
  }
  const antiguo = abiertos[0] ?? null;
  return {
    abiertos: abiertos.length,
    sinClasificar,
    porDestino,
    masAntiguo: antiguo ? { id: codigo(antiguo.id), fecha: antiguo.fecha, dias: diasDesde(antiguo.fecha), destino: antiguo.destino } : null,
    cerrados: db.prepare("SELECT count(*) AS n FROM cabos WHERE estado = 'cerrado'").get().n,
  };
}

// ── presentación ────────────────────────────────────────────────────────────

function pintar(db, c, completo) {
  const cabecera = `${codigo(c.id)} · ${fechaES(c.fecha)} · ${c.destino ?? 'SIN CLASIFICAR'} · ${c.sujeto}`;
  const texto = completo || c.texto.length <= 220 ? c.texto : `${c.texto.slice(0, 220)}…`;
  const lineas = [cabecera, `      ${texto}`, `      origen: ${c.origen}`];
  if (completo) {
    for (const m of movimientosDe(db, c.id).filter((m) => m.accion === 'nota' || m.accion === 'clasificar')) {
      lineas.push(`      ${m.accion} ${fechaES(m.momento)}: ${m.detalle}`);
    }
  }
  if (c.estado === 'cerrado') lineas.push(`      CERRADO ${fechaES(c.cerrado)} · ${[c.cierre, c.ref, c.motivo].filter(Boolean).join(' · ')}`);
  return lineas.join('\n');
}

function pintarResumen(r) {
  if (r.abiertos === 0) return `Cabos: ninguno abierto (${r.cerrados} cerrados).`;
  const destinos = Object.entries(r.porDestino).filter(([, n]) => n > 0).map(([d, n]) => `${d} ${n}`).join(' · ');
  const lineas = [`Cabos abiertos: ${r.abiertos} · sin clasificar: ${r.sinClasificar}${destinos ? ` · ${destinos}` : ''}`];
  const m = r.masAntiguo;
  lineas.push(`  el más antiguo: ${m.id}, del ${fechaES(m.fecha)} (hace ${m.dias} ${m.dias === 1 ? 'día' : 'días'}) · ${m.destino ?? 'sin clasificar'}`);
  return lineas.join('\n');
}

// ── línea de órdenes ────────────────────────────────────────────────────────

function leerArgs(argv) {
  const pos = [];
  const op = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const clave = a.slice(2);
      const sig = argv[i + 1];
      if (sig === undefined || sig.startsWith('--')) op[clave] = true;
      else { op[clave] = sig; i++; }
    } else pos.push(a);
  }
  return { pos, op };
}

function principal(argv) {
  const { pos, op } = leerArgs(argv);
  const [orden, ...resto] = pos;
  const db = abrir();

  switch (orden) {
    case 'alta': {
      const entradas = op.json
        ? [].concat(JSON.parse(fs.readFileSync(op.json, 'utf8')))
        : [{ sujeto: op.sujeto, origen: op.origen, texto: op.texto, destino: op.destino }];
      for (const e of entradas) {
        const { id, parecidos } = alta(db, e);
        console.log(`${codigo(id)} dado de alta · ${e.destino ?? 'sin clasificar'} · ${e.sujeto}`);
        for (const p of parecidos) console.log(`  ojo, abierto con un sujeto parecido: ${codigo(p.id)} · ${p.sujeto}`);
      }
      return;
    }
    case 'lista': {
      const filas = listar(db, { todos: !!op.todos, sinClasificar: !!op['sin-clasificar'], destino: op.destino || null, sujeto: op.sujeto || null });
      if (op.json) { console.log(JSON.stringify(filas.map((f) => ({ ...f, codigo: codigo(f.id) })), null, 2)); return; }
      if (!filas.length) { console.log('Ningún cabo con ese filtro.'); return; }
      console.log(filas.map((f) => pintar(db, f, !!op.completo)).join('\n\n'));
      console.log(`\n${filas.length} ${filas.length === 1 ? 'cabo' : 'cabos'}.`);
      return;
    }
    case 'ver': {
      const id = leerId(resto[0]);
      const c = obtener(db, id);
      console.log(pintar(db, c, true));
      console.log('\n  movimientos:');
      for (const m of movimientosDe(db, id)) console.log(`  · ${fechaES(m.momento)} ${m.momento.slice(11, 16)} ${m.accion}${m.detalle ? ` — ${m.detalle}` : ''}`);
      return;
    }
    case 'resumen': {
      const r = resumen(db);
      console.log(op.json ? JSON.stringify(r, null, 2) : pintarResumen(r));
      return;
    }
    case 'clasificar': {
      const id = leerId(resto[0]);
      clasificar(db, id, resto[1], typeof op.nota === 'string' ? op.nota : null);
      console.log(`${codigo(id)} → ${resto[1]}`);
      return;
    }
    case 'nota': {
      const id = leerId(resto[0]);
      anotar(db, id, typeof op.texto === 'string' ? op.texto : '');
      console.log(`${codigo(id)}: nota añadida`);
      return;
    }
    case 'cerrar': {
      const id = leerId(resto[0]);
      cerrar(db, id, { como: op.como, motivo: typeof op.motivo === 'string' ? op.motivo : null, ref: typeof op.ref === 'string' ? op.ref : null });
      console.log(`${codigo(id)} cerrado (${op.como})`);
      return;
    }
    default:
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 16).map((l) => l.replace(/^ \*\s?/, '')).join('\n'));
      if (orden) process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    principal(process.argv.slice(2));
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exitCode = 1;
  }
}
