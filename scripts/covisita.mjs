/**
 * Grafo de co-visita — meskeIA (análisis descriptivo, solo lectura)
 *
 * Pregunta que responde: ¿dentro de las sesiones que tocan ≥2 apps, las
 * transiciones se CONCENTRAN (señal aprovechable para recomendar) o son
 * ALEATORIAS (ruido)? Si es ruido, ningún algoritmo mejora el descubrimiento
 * y nos ahorramos construir nada.
 *
 * Método:
 *  - Reconstruye sesiones vía sesion_id (excluye bots/mcp/chatgpt/propio).
 *  - Grafo NO dirigido de co-ocurrencia app↔app (una vez por sesión).
 *  - Grafo dirigido de transiciones consecutivas app→app.
 *  - Métrica clave: LIFT = P(A,B) / (P(A)·P(B)). Descuenta la popularidad:
 *    un lift >> 1 = las dos apps aparecen juntas MUCHO más que por azar.
 *
 * Uso:  node scripts/covisita.mjs [dias]     (por defecto 90)
 * Solo hace SELECT. No modifica la base de datos.
 */

import { createClient } from '@libsql/client';
import { writeFileSync } from 'node:fs';
import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

const DIAS = Number(process.argv[2]) || 90;
const MIN_SOPORTE = 5;      // co-ocurrencias mínimas para que el lift sea fiable
const LIFT_FUERTE = 3;      // umbral de afinidad "fuerte" (3x sobre el azar)

// Slugs que son navegación, no una app-herramienta: los excluimos del análisis
// de AFINIDAD (un hub como la home coincide con todo por construcción).
// ⚠️ 20/08/2026: la entrada era 'meskeia' en minúsculas y el valor real en la tabla
// es 'meskeIA' — un Set de JS distingue mayúsculas, así que este filtro NUNCA llegó a
// excluir nada. Y `meskeIA` tampoco era la home: hasta hoy fue el cubo compartido de
// /acerca/, /contacto/, /mcp/, /privacidad/, /terminos/ y la página de ERROR, que
// coinciden con todo por construcción igual que un hub. Desde hoy esas páginas emiten
// `pag:<pagina>`; se filtran por prefijo, y se conserva 'meskeIA' porque el histórico
// crudo lo mantiene y este script recorre 90 días por defecto.
const HOME = new Set(['home', '/', 'index', 'meskeia', 'meskeIA', 'meskeia-home']);
const esNavegacion = (x) => HOME.has(x) || String(x).startsWith('pag:');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const linea = '═'.repeat(70);
console.log(linea);
console.log(`  GRAFO DE CO-VISITA — meskeIA`);
console.log(`  Ventana: últimos ${DIAS} días · excluye bots/MCP/ChatGPT/propio`);
console.log(linea + '\n');

// ─────────────────────────────────────────────────────────────
// 1. Cargar eventos ordenados por sesión y momento
// ─────────────────────────────────────────────────────────────
const res = await client.execute({
  sql: `SELECT sesion_id, aplicacion, created_at
        FROM uso_aplicaciones
        WHERE sesion_id IS NOT NULL AND sesion_id != ''
          AND created_at >= datetime('now', ?)
          AND (modo IS NULL OR modo NOT IN ('bot','mcp','chatgpt','share-emit'))
          AND (es_propio IS NULL OR es_propio = 0)
        ORDER BY sesion_id ASC, created_at ASC, id ASC`,
  args: [`-${DIAS} days`],
});

// Agrupar por sesión conservando el orden
const sesiones = new Map();
for (const row of res.rows) {
  const sid = String(row.sesion_id);
  const app = String(row.aplicacion || '').trim();
  if (!app) continue;
  if (!sesiones.has(sid)) sesiones.set(sid, []);
  sesiones.get(sid).push(app);
}

// ─────────────────────────────────────────────────────────────
// 2. Métricas de sesión + construcción de los grafos
// ─────────────────────────────────────────────────────────────
const appSes = new Map();       // app -> nº de sesiones que la contienen
const pares = new Map();         // "A|B" (ordenado) -> nº de sesiones con ambas
const trans = new Map();         // "A→B" -> nº de transiciones consecutivas
const distLong = { 1: 0, 2: 0, 3: 0, '4-5': 0, '6+': 0 };

let totalSes = 0, multiSes = 0;
const inc = (m, k) => m.set(k, (m.get(k) || 0) + 1);

for (const [, secuencia] of sesiones) {
  totalSes++;
  const unicas = [...new Set(secuencia)];
  const n = unicas.length;

  if (n === 1) distLong[1]++;
  else if (n === 2) distLong[2]++;
  else if (n === 3) distLong[3]++;
  else if (n <= 5) distLong['4-5']++;
  else distLong['6+']++;
  if (n >= 2) multiSes++;

  // Cobertura por app (una vez por sesión)
  for (const a of unicas) inc(appSes, a);

  // Pares no dirigidos (una vez por sesión, todas las combinaciones)
  for (let i = 0; i < unicas.length; i++) {
    for (let j = i + 1; j < unicas.length; j++) {
      const [a, b] = [unicas[i], unicas[j]].sort();
      inc(pares, `${a}|${b}`);
    }
  }

  // Transiciones dirigidas: apps consecutivas distintas (colapsando repeticiones)
  for (let i = 1; i < secuencia.length; i++) {
    const a = secuencia[i - 1], b = secuencia[i];
    if (a !== b) inc(trans, `${a}→${b}`);
  }
}

const pctMulti = totalSes ? (multiSes / totalSes) * 100 : 0;

console.log('1. VOLUMEN Y FORMA DE LAS SESIONES\n');
console.log(`   Eventos cargados:            ${res.rows.length}`);
console.log(`   Sesiones (sesion_id únicos): ${totalSes}`);
console.log(`   Sesiones multi-app (≥2):     ${multiSes}  (${pctMulti.toFixed(1)}%)`);
console.log(`   Sesiones single-app:         ${totalSes - multiSes}  (${(100 - pctMulti).toFixed(1)}%)\n`);
console.log('   Distribución por nº de apps distintas:');
for (const [k, v] of Object.entries(distLong)) {
  const pct = totalSes ? (v / totalSes * 100).toFixed(1) : '0';
  console.log(`     ${String(k).padEnd(4)} → ${String(v).padStart(6)}  (${pct}%)`);
}

// ─────────────────────────────────────────────────────────────
// 3. Concentración del grafo (señal vs ruido)
// ─────────────────────────────────────────────────────────────
console.log('\n2. CONCENTRACIÓN DEL GRAFO DE PARES (señal vs ruido)\n');
const buckets = { '1': 0, '2': 0, '3-4': 0, '5-9': 0, '10+': 0 };
let pesoTotal = 0;
for (const [, w] of pares) {
  pesoTotal += w;
  if (w === 1) buckets['1']++;
  else if (w === 2) buckets['2']++;
  else if (w <= 4) buckets['3-4']++;
  else if (w <= 9) buckets['5-9']++;
  else buckets['10+']++;
}
console.log(`   Pares distintos (aristas):   ${pares.size}`);
console.log(`   Peso total (co-ocurrencias): ${pesoTotal}`);
console.log('   Reparto de aristas por peso (nº de sesiones que comparten el par):');
for (const [k, v] of Object.entries(buckets)) {
  const pct = pares.size ? (v / pares.size * 100).toFixed(1) : '0';
  console.log(`     peso ${k.padEnd(4)} → ${String(v).padStart(6)} aristas  (${pct}%)`);
}
console.log('   → Si casi todo es peso 1, el grafo es ruido: cada par ocurrió una vez.');

// ─────────────────────────────────────────────────────────────
// 4. Top transiciones dirigidas
// ─────────────────────────────────────────────────────────────
const topTrans = [...trans.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
console.log('\n3. TOP 20 TRANSICIONES DIRIGIDAS (app → siguiente app)\n');
if (!topTrans.length) console.log('   (sin transiciones)');
for (const [k, w] of topTrans) console.log(`   ${String(w).padStart(4)} ×  ${k}`);

// ─────────────────────────────────────────────────────────────
// 5. Top pares por afinidad (lift), con soporte mínimo, sin home
// ─────────────────────────────────────────────────────────────
const conLift = [];
for (const [k, co] of pares) {
  const [a, b] = k.split('|');
  if (esNavegacion(a) || esNavegacion(b)) continue;      // afinidad entre herramientas
  if (co < MIN_SOPORTE) continue;                // soporte mínimo para fiabilidad
  const lift = (co * totalSes) / (appSes.get(a) * appSes.get(b));
  conLift.push({ a, b, co, lift });
}
conLift.sort((x, y) => y.lift - x.lift);

console.log(`\n4. TOP PARES POR AFINIDAD (lift) — soporte ≥ ${MIN_SOPORTE}, sin home\n`);
console.log(`   lift = veces que el par aparece junto SOBRE lo esperado por azar\n`);
if (!conLift.length) {
  console.log(`   (ningún par alcanza el soporte mínimo de ${MIN_SOPORTE} co-visitas)`);
} else {
  console.log('   lift  | co | app A                          | app B');
  console.log('   ------|----|--------------------------------|------------------------------');
  for (const p of conLift.slice(0, 25)) {
    console.log(`   ${p.lift.toFixed(1).padStart(5)} | ${String(p.co).padStart(2)} | ${p.a.slice(0, 30).padEnd(30)} | ${p.b.slice(0, 30)}`);
  }
}

// ─────────────────────────────────────────────────────────────
// 6. Veredicto
// ─────────────────────────────────────────────────────────────
const fuertes = conLift.filter(p => p.lift >= LIFT_FUERTE);
console.log('\n' + linea);
console.log('  VEREDICTO');
console.log(linea);
console.log(`   Sesiones multi-app: ${multiSes} (${pctMulti.toFixed(1)}%)`);
console.log(`   Pares con soporte ≥${MIN_SOPORTE}: ${conLift.length}`);
console.log(`   Pares con afinidad fuerte (lift ≥${LIFT_FUERTE}): ${fuertes.length}`);
console.log('');
if (multiSes < 30 || conLift.length === 0) {
  console.log('   🟡 DATOS RALOS. No hay base estadística para un algoritmo de');
  console.log('      recomendación app→app. El cuello de botella es el DESCUBRIMIENTO');
  console.log('      (lograr que entren viendo ≥2 apps), no la recomendación.');
} else if (fuertes.length >= 10) {
  console.log('   🟢 HAY SEÑAL CLARA. Varios pares co-ocurren muy por encima del azar.');
  console.log('      Candidatos concretos para reforzar RelatedApps con datos reales.');
} else {
  console.log('   🟠 SEÑAL DÉBIL/PARCIAL. Hay algunos pares con afinidad, pero pocos.');
  console.log('      Sirve para retocar RelatedApps puntualmente, no para automatizar.');
}
console.log(linea);

// ─────────────────────────────────────────────────────────────
// 7. Volcado JSON opcional (para cruce y visualización)
//    Uso: COVISITA_OUT=/ruta/datos.json node scripts/covisita.mjs
// ─────────────────────────────────────────────────────────────
const OUT = process.env.COVISITA_OUT;
if (OUT) {
  const MIN_ARISTA = 3; // aristas con ≥3 co-visitas (grafo legible, sin ruido de peso 1-2)
  const nodeSet = new Set();
  const edges = [];
  for (const [k, co] of pares) {
    if (co < MIN_ARISTA) continue;
    const [a, b] = k.split('|');
    if (esNavegacion(a) || esNavegacion(b)) continue; // afinidad entre herramientas, no navegación
    const lift = (co * totalSes) / (appSes.get(a) * appSes.get(b));
    edges.push({ a, b, co, lift: Math.round(lift * 10) / 10 });
    nodeSet.add(a); nodeSet.add(b);
  }
  const nodes = [...nodeSet].map(id => ({ id, sessions: appSes.get(id) || 0 }));
  const affinity = conLift.map(p => ({ a: p.a, b: p.b, co: p.co, lift: Math.round(p.lift * 10) / 10 }));
  writeFileSync(OUT, JSON.stringify({
    meta: { dias: DIAS, totalSes, multiSes, pctMulti: Math.round(pctMulti * 10) / 10 },
    nodes, edges, affinity,
  }, null, 2));
  console.log(`\n📄 JSON escrito en ${OUT}  (${nodes.length} nodos, ${edges.length} aristas)`);
}

await client.close?.();
