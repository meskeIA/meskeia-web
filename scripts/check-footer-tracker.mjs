#!/usr/bin/env node
/**
 * Script: check-footer-tracker.mjs
 *
 * Candado del PIE QUE CUENTA DOS VECES. Se ejecuta antes de cada build (`npm run build`) y a
 * mano con `npm run check:footer-tracker`.
 *
 * QUÉ PROHÍBE
 * ───────────
 * Que un `.tsx` de `app/` monte MÁS DE UN `<Footer appName=…>` (un `return` por fase:
 * portada, cuestionario, resultado…) sin que todos lleven la MISMA `key`.
 *
 * `<Footer appName>` monta el `AnalyticsTracker`, cuyo efecto de montaje hace un POST a
 * `/api/analytics/track/`: una VISITA. Si cada fase pone el Footer en otra posición del árbol,
 * React no lo reconcilia: lo desmonta y lo vuelve a montar, y cada cambio de fase cuenta como
 * una visita nueva. Con la misma `key` en todos, y la misma raíz en cada fase, React empareja
 * el Footer por su clave y es el mismo de principio a fin.
 *
 * DE DÓNDE SALE
 * ─────────────
 * De los hallazgos 2175 y 2176 de test-perfil-inversor (26/09/2026, reparado en bbb70c9b): una
 * carga con Comenzar → Ver resultado → Revisar → Ver resultado → Repetir registraba SEIS
 * visitas, y eso fabricó su firma de rotura (la mitad de sus «recargas» eran cambios de fase).
 * El cabo C0042 encontró la misma forma en cinco apps más, reparadas con `key="pie"` en
 * 090b9eb0 (12/10/2026), y una sexta, quiz-tipos-plantas (C0224, 498e33d6), que quita el pie
 * durante el juego y por eso se reparó sacando el tracker del Footer.
 *
 * SEGUNDA FORMA: UN TRACKER SUELTO JUNTO AL DEL PIE (27/10/2026, cabo C0472)
 * ──────────────────────────────────────────────────────────────────────────
 * También rompe un `.tsx` de `app/` que monte `<AnalyticsTracker>` Y un `<Footer appName>`: son
 * dos trackers en la misma carga, y el tracker no deduplica. Seis apps lo hacían
 * (calculadora-propinas, calculadora-fechas, comparador-coste-vida, conversor-divisas,
 * enchufes-por-pais y presupuesto-viaje; reparadas en 8cc9f09a): entre el 75 y el 100 % de sus
 * visitas tenían gemela de la misma sesión, y calculadora-propinas con dos nombres distintos.
 * Un tracker suelto es legítimo con el Footer SIN appName (quiz-tipos-plantas, error.tsx, las
 * portadas de los portales).
 *
 * SIN PASIVO
 * ──────────
 * Barre `app/` entero. Con esos tres commits y la `key` puesta en los dos Footer de
 * curso-emprendimiento ya no quedaba ninguno: solo puede encenderlo código nuevo. La segunda
 * forma, tampoco desde 8cc9f09a.
 *
 * QUÉ NO MIRA, Y POR QUÉ
 * ──────────────────────
 *   · Un Footer que DESAPARECE en una fase (la forma de quiz-tipos-plantas) cuando solo queda
 *     uno en el fichero: un solo Footer no se distingue, por la forma del código, de una app
 *     de una fase. Lo mide el testigo `tests/apps/footer-una-visita-por-carga.spec.ts`.
 *   · Que la RAÍZ de cada fase sea del mismo tipo: con `key` igual y raíces distintas
 *     (`<div>` en una, `<main>` en otra) React también lo remonta. Mismo testigo.
 *   · Los Footer sin `appName`, que no montan tracker.
 *
 * ESCAPE
 * ──────
 * `footer-ok: <razón>` en la línea del Footer o en las tres anteriores (un comentario JSX).
 * **La razón es obligatoria**: la marca a secas también rompe el build.
 *
 * Sus casos de prueba se le reinyectan con `npm run footer-tracker:probar-candado`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ_DEFECTO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iRaiz = process.argv.indexOf('--raiz');
const RAIZ = iRaiz !== -1 ? path.resolve(process.argv[iRaiz + 1]) : RAIZ_DEFECTO;

function recorrer(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') recorrer(p, out); }
    else if (e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
}

/** Quita comentarios conservando los saltos de línea, para no mover los números de línea. */
const sinComentarios = (txt) => txt
  .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
  .replace(/^(\s*)\/\/.*$/gm, '$1');

// ─── Escape ────────────────────────────────────────────────────────────────────
function escapeEn(lineas, n) {
  const trozo = lineas.slice(Math.max(0, n - 4), n).join('\n');
  const m = trozo.match(/footer-ok:([^\n]*)/);
  if (!m) return null;
  const razon = m[1].replace(/\*\/.*$/, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').trim();
  return /\p{L}{3,}/u.test(razon) ? 'firmado' : 'sin razón';
}

// ─── Barrido ───────────────────────────────────────────────────────────────────
const errores = [];
const exentos = [];
let ficheros = 0;
let conVarios = 0;
for (const ruta of recorrer(path.join(RAIZ, 'app'))) {
  ficheros++;
  const txt = fs.readFileSync(ruta, 'utf8');
  const limpio = sinComentarios(txt);
  const lineas = txt.split('\n');
  const pies = [...limpio.matchAll(/<Footer\b([^>]*)>/g)]
    .filter((m) => /\bappName\s*=/.test(m[1]))
    .map((m) => {
      const k = m[1].match(/\bkey\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*['"`]([^'"`]*)['"`]\s*\})/);
      return { linea: limpio.slice(0, m.index).split('\n').length, key: k ? (k[1] ?? k[2] ?? k[3]) : null };
    });
  // Segunda forma: un <AnalyticsTracker> suelto junto a un <Footer appName> (cabo C0472)
  if (pies.length > 0) {
    const relT = path.relative(RAIZ, ruta).replace(/\\/g, '/');
    for (const m of limpio.matchAll(/<AnalyticsTracker\b/g)) {
      const linea = limpio.slice(0, m.index).split('\n').length;
      const escape = escapeEn(lineas, linea);
      if (escape === 'firmado') { exentos.push(`${relT}:${linea}`); continue; }
      const porQue = escape === 'sin razón' ? ' — lleva `footer-ok:` SIN razón escrita' : '';
      errores.push(`${relT}:${linea} — \`<AnalyticsTracker>\` suelto en un fichero que monta \`<Footer appName>\` (l. ${pies[0].linea}), que ya lleva el suyo: cada carga cuenta DOS visitas. Quita el suelto y deja el del pie.${porQue}`);
    }
  }
  if (pies.length < 2) continue;
  conVarios++;
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/');
  // Un Footer exento sale de la comparación: si no, su falta de key acusaría a los demás
  for (const p of pies) p.escape = escapeEn(lineas, p.linea);
  for (const p of pies) if (p.escape === 'firmado') exentos.push(`${rel}:${p.linea}`);
  const vigilados = pies.filter((p) => p.escape !== 'firmado');
  if (vigilados.length < 2) continue;
  const claves = new Set(vigilados.map((p) => p.key));
  if (!claves.has(null) && claves.size === 1) continue;
  const malos = vigilados.filter((p) => p.key === null || claves.size > 1);
  for (const p of malos) {
    const que = p.key === null ? 'sin `key`' : `con \`key="${p.key}"\` distinta de las otras`;
    const porQue = p.escape === 'sin razón' ? ' — lleva `footer-ok:` SIN razón escrita' : '';
    errores.push(`${rel}:${p.linea} — uno de los ${pies.length} \`<Footer appName>\` del fichero va ${que}: al cambiar de fase React lo remonta y su AnalyticsTracker cuenta otra visita. Pon la misma \`key="pie"\` en todos.${porQue}`);
  }
}

if (ficheros === 0) {
  console.error(`\n❌ Pie que cuenta dos veces: no he leído ningún .tsx en app/ de ${RAIZ}\n`);
  process.exit(1);
}

if (errores.length) {
  console.error(`\n❌ Pie que cuenta dos veces: ${errores.length} problema(s)\n`);
  for (const e of errores) console.error(`   · ${e}`);
  console.error('');
  process.exit(1);
}

console.log('✅ Pie que cuenta dos veces: correcto');
console.log(`   · ${ficheros} ficheros .tsx de app/, sin pasivo; ${conVarios} montan varios <Footer appName>, todos con la misma key`);
if (exentos.length) console.log(`   · ${exentos.length} exento(s) con \`footer-ok\`: ${exentos.slice(0, 5).join(', ')}`);
