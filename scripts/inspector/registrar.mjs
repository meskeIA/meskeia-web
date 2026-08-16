#!/usr/bin/env node
/**
 * inspector:registrar — guarda el acta de una inspección en la base
 *
 * Ejecutar:  node scripts/inspector/registrar.mjs acta.json
 *            cat acta.json | node scripts/inspector/registrar.mjs
 *
 * Existe para que la skill `/inspector` NO escriba SQL: entrega un JSON y este script
 * lo valida y lo guarda. Si el acta no cumple las reglas, se rechaza entera y no se
 * registra nada — es preferible perder una inspección que ensuciar la base con un
 * veredicto que nadie podrá comprobar después.
 *
 * FORMATO DEL ACTA
 * ────────────────
 * {
 *   "slug": "calculadora-iva",
 *   "modelo": "opus-5",
 *   "segundos": 240,
 *   "veredicto": "ok" | "con_hallazgos" | "no_inspeccionable",
 *   //  ↑ lo que manda el acta. Lo que se GUARDA se deriva de la severidad máxima:
 *   //    sin hallazgos → ok · solo medios/bajos → con_hallazgos_menores ·
 *   //    alguno alto o crítico → con_hallazgos. Ver derivarVeredicto.
 *   "resumen": "qué se ha comprobado y con qué casos",
 *   "test_path": "tests/apps/calculadora-iva.spec.ts",   // opcional pero muy recomendable
 *   "hallazgos": [
 *     {
 *       "tipo": "calculo",  "severidad": "alto",
 *       "descripcion": "el IVA reducido aplica 10% donde corresponde 4%",
 *       "caso": "base 100 € · tipo superreducido → esperado 4,00 € · obtenido 10,00 €"
 *     }
 *   ]
 * }
 *
 * LAS DOS REGLAS QUE SE HACEN CUMPLIR AQUÍ
 * ────────────────────────────────────────
 * 1. NINGÚN HALLAZGO SIN CASO REPRODUCIBLE. Un hallazgo cuyo `caso` no diga entrada,
 *    resultado esperado y resultado obtenido es una opinión de un modelo, no un defecto.
 *    Sin esa regla, la base se llena de sospechas que nadie puede confirmar ni cerrar.
 * 2. VEREDICTO Y HALLAZGOS DEBEN CONCORDAR. `ok` con hallazgos, o `con_hallazgos` sin
 *    ninguno, señala que el acta se escribió sin mirar lo que decía.
 */

import fs from 'fs';
import { abrir } from './db.mjs';

// Lo que puede mandar un acta. El subagente sigue diciendo solo "ok" o "con_hallazgos":
// no tiene que acertar el matiz, porque el veredicto se DERIVA (ver derivarVeredicto).
const VEREDICTOS = ['ok', 'con_hallazgos', 'con_hallazgos_menores', 'no_inspeccionable'];
const TIPOS = ['calculo', 'dato', 'operativa', 'accesibilidad', 'contenido'];
const SEVERIDADES = ['critico', 'alto', 'medio', 'bajo'];

/**
 * El veredicto que se GUARDA sale de la severidad máxima encontrada, no de lo que opine
 * el modelo.
 *
 * ── De dónde sale (16/08/2026) ────────────────────────────────────────────────
 * El contador de veredicto repetido saltó con 8 "con_hallazgos" seguidos. El aviso estaba
 * bien disparado, pero la causa no era que el Inspector hubiera dejado de mirar —esa misma
 * tanda encontró 18 hallazgos, varios con su control— sino que el veredicto era BINARIO
 * mientras los hallazgos tienen severidad: "con_hallazgos" metía en la misma casilla «cobra
 * el doble de ITP en Ceuta» y «un porcentaje escrito con punto en vez de coma». Con ese
 * listón ninguna app de un catálogo de 985 iba a salir limpia nunca, así que el veredicto
 * no informaba aunque el Inspector funcionase perfectamente.
 *
 * Nótese la diferencia con el caso que originó el contador (el semáforo del digest, que
 * marcó ✅ 21 veces mientras la métrica caía): allí el indicador mentía, aquí solo estaba
 * mal graduado. Por eso la respuesta es calibrar la escala y no desconfiar del detector.
 */
function derivarVeredicto(declarado, hallazgos) {
  if (declarado === 'no_inspeccionable') return 'no_inspeccionable';
  if (!hallazgos.length) return 'ok';
  const grave = hallazgos.some(h => h.severidad === 'critico' || h.severidad === 'alto');
  return grave ? 'con_hallazgos' : 'con_hallazgos_menores';
}

function leerEntrada() {
  const f = process.argv[2];
  if (f) return fs.readFileSync(f, 'utf8');
  return fs.readFileSync(0, 'utf8');
}

const errores = [];
let acta;
try {
  acta = JSON.parse(leerEntrada());
} catch (e) {
  console.error(`✗ El acta no es JSON válido: ${e.message}`);
  process.exit(1);
}

const actas = Array.isArray(acta) ? acta : [acta];
const db = abrir();
const existe = db.prepare('SELECT slug, hash_codigo, hash_deps FROM apps WHERE slug = ?');

for (const [i, a] of actas.entries()) {
  const donde = `acta ${i + 1}${a.slug ? ` (${a.slug})` : ''}`;
  if (!a.slug) { errores.push(`${donde}: falta "slug"`); continue; }
  if (!existe.get(a.slug)) errores.push(`${donde}: el slug no está en la base — ¿falta ejecutar inspector:sync?`);
  if (!VEREDICTOS.includes(a.veredicto)) errores.push(`${donde}: veredicto "${a.veredicto}" no válido (${VEREDICTOS.join(' | ')})`);
  if (!a.resumen || a.resumen.length < 20) errores.push(`${donde}: el resumen debe decir QUÉ se comprobó y con qué casos`);

  const hallazgos = a.hallazgos || [];
  for (const [j, h] of hallazgos.entries()) {
    const d = `${donde}, hallazgo ${j + 1}`;
    if (!TIPOS.includes(h.tipo)) errores.push(`${d}: tipo "${h.tipo}" no válido (${TIPOS.join(' | ')})`);
    if (!SEVERIDADES.includes(h.severidad)) errores.push(`${d}: severidad "${h.severidad}" no válida`);
    if (!h.descripcion) errores.push(`${d}: falta descripción`);
    // Regla 1: sin caso reproducible no hay hallazgo
    if (!h.caso || h.caso.length < 15)
      errores.push(`${d}: falta el caso reproducible (entrada → esperado vs obtenido). Sin él, no es un hallazgo.`);
  }

  // Regla 2: el veredicto tiene que concordar con lo que se ha encontrado. Solo se
  // comprueba la contradicción de fondo (decir "ok" habiendo encontrado algo, o al revés);
  // el matiz entre menores y graves lo pone derivarVeredicto, no el modelo.
  if (a.veredicto === 'ok' && hallazgos.length)
    errores.push(`${donde}: veredicto "ok" con ${hallazgos.length} hallazgo(s)`);
  if (a.veredicto.startsWith('con_hallazgos') && !hallazgos.length)
    errores.push(`${donde}: veredicto "${a.veredicto}" sin ninguno`);
  if (a.test_path && !fs.existsSync(a.test_path))
    errores.push(`${donde}: test_path "${a.test_path}" no existe en el disco`);
}

if (errores.length) {
  console.error('\n✗ Acta rechazada — no se ha registrado nada:\n');
  for (const e of errores) console.error('  · ' + e);
  console.error('');
  process.exit(1);
}

const hoy = new Date().toISOString().slice(0, 10);
const insInsp = db.prepare(`INSERT INTO inspecciones (slug, fecha, modelo, veredicto, resumen, test_path, segundos)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
const insHall = db.prepare(`INSERT INTO hallazgos (inspeccion_id, slug, tipo, severidad, descripcion, caso, fecha)
                            VALUES (?, ?, ?, ?, ?, ?, ?)`);
const actApp = db.prepare(`UPDATE apps SET ultima_inspeccion = ?, veredicto = ?, test_path = COALESCE(?, test_path),
                           hash_inspeccionado = hash_codigo || '|' || COALESCE(hash_deps, '') WHERE slug = ?`);

let nH = 0;
for (const a of actas) {
  const veredicto = derivarVeredicto(a.veredicto, a.hallazgos || []);
  if (veredicto !== a.veredicto) {
    console.log(`   ${a.slug}: veredicto "${a.veredicto}" → "${veredicto}" (por la severidad máxima encontrada)`);
  }
  const r = insInsp.run(a.slug, hoy, a.modelo || null, veredicto, a.resumen, a.test_path || null, a.segundos || null);
  for (const h of a.hallazgos || []) {
    insHall.run(r.lastInsertRowid, a.slug, h.tipo, h.severidad, h.descripcion, h.caso, hoy);
    nH++;
  }
  actApp.run(hoy, veredicto, a.test_path || null, a.slug);
}

console.log(`✓ ${actas.length} acta(s) registrada(s) · ${nH} hallazgo(s)`);

// Contador de veredicto repetido: un indicador que sale siempre igual deja de informar.
const ultimos = db.prepare(`SELECT veredicto FROM inspecciones ORDER BY id DESC LIMIT 8`).all().map(r => r.veredicto);
let racha = 0;
for (const v of ultimos) { if (v === ultimos[0]) racha++; else break; }
if (racha >= 5)
  console.log(`\n⚠  ${racha} veredictos "${ultimos[0]}" seguidos. La lectura por defecto ya NO es que el catálogo\n` +
              `   esté bien, sino que el Inspector ha dejado de mirar. Antes de seguir, comprobar que\n` +
              `   encuentra un fallo conocido (meter uno a propósito en una app y ver si lo caza).`);
else if (racha > 1)
  console.log(`   (${racha} veredictos "${ultimos[0]}" seguidos)`);
