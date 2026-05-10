/**
 * Análisis comparativo: Simuladores vs Estimadores vs Calculadoras
 *
 * Objetivo: Validar (o refutar) la hipótesis de que los simuladores
 * tienen mejor engagement que los estimadores/calculadoras.
 *
 * Métricas medidas:
 *  - Visitas totales (aplicacion)
 *  - Duración promedio por visita
 *  - % de usuarios recurrentes
 *  - % de share (datos_adicionales con ref:share)
 *  - Apps por categoría (para normalizar)
 */

import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Cargar implemented-apps para conocer el universo de apps
const implementedAppsRaw = readFileSync('data/implemented-apps.ts', 'utf8');

// Extraer slugs (apps implementadas) — formato: "/slug/",
const slugsImplementados = new Set();
const matches = implementedAppsRaw.matchAll(/["']\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)\/["']/g);
for (const m of matches) slugsImplementados.add(m[1]);

console.log(`\nUniverso de apps implementadas: ${slugsImplementados.size}\n`);

/** Clasifica una app por su prefijo */
function clasificar(slug) {
  if (slug.startsWith('simulador-')) return 'simulador';
  if (slug.startsWith('estimador-')) return 'estimador';
  if (slug.startsWith('calculadora-')) return 'calculadora';
  if (slug.startsWith('visualizador-')) return 'visualizador';
  if (slug.startsWith('curso-')) return 'curso';
  if (slug.startsWith('orientador-')) return 'orientador';
  if (slug.startsWith('planificador-')) return 'planificador';
  if (slug.startsWith('test-')) return 'test';
  if (slug.startsWith('checklist-')) return 'checklist';
  if (slug.startsWith('generador-')) return 'generador';
  if (slug.startsWith('conversor-')) return 'conversor';
  if (slug.startsWith('guia-')) return 'guia';
  return 'otro';
}

// Censo del universo (cuántas apps hay de cada tipo)
const censoUniverso = {};
for (const slug of slugsImplementados) {
  const cat = clasificar(slug);
  censoUniverso[cat] = (censoUniverso[cat] || 0) + 1;
}

console.log('Censo de apps por tipo (universo total):');
console.log(censoUniverso);
console.log();

// Consultar agregados desde Turso (excluyendo IP propia)
const ipExcluidaRow = await client.execute(
  `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`
);
const ipExcluida = ipExcluidaRow.rows[0]?.valor || '';

const filtroIp = ipExcluida
  ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ipExcluida}')`
  : '';

console.log(`IP excluida del análisis: ${ipExcluida ? 'sí (filtrada)' : 'no'}\n`);

// Métricas globales por tipo
const sql = `
  SELECT
    aplicacion,
    COUNT(*) as visitas,
    AVG(CASE WHEN duracion_segundos IS NOT NULL AND duracion_segundos > 0 AND duracion_segundos < 1800 THEN duracion_segundos END) as duracion_avg,
    SUM(CASE WHEN es_recurrente = 1 THEN 1 ELSE 0 END) as recurrentes,
    SUM(CASE WHEN datos_adicionales LIKE '%"ref":"share"%' THEN 1 ELSE 0 END) as shares,
    MIN(timestamp) as primera_visita,
    MAX(timestamp) as ultima_visita
  FROM uso_aplicaciones
  WHERE 1=1 ${filtroIp}
  GROUP BY aplicacion
`;

const result = await client.execute(sql);

// Agrupar por categoría
const porCategoria = {};
for (const row of result.rows) {
  const slug = String(row.aplicacion);
  const cat = clasificar(slug);
  if (!porCategoria[cat]) {
    porCategoria[cat] = {
      apps: [],
      totalVisitas: 0,
      sumDuracion: 0,
      countDuracion: 0,
      totalRecurrentes: 0,
      totalShares: 0,
    };
  }
  const visitas = Number(row.visitas);
  const duracion = Number(row.duracion_avg) || 0;
  const recurrentes = Number(row.recurrentes);
  const shares = Number(row.shares);

  porCategoria[cat].apps.push({
    slug,
    visitas,
    duracion: Math.round(duracion),
    recurrentes,
    shares,
    porcRecurrentes: visitas > 0 ? (recurrentes / visitas) * 100 : 0,
    primera: row.primera_visita,
    ultima: row.ultima_visita,
  });
  porCategoria[cat].totalVisitas += visitas;
  if (duracion > 0) {
    porCategoria[cat].sumDuracion += duracion * visitas;
    porCategoria[cat].countDuracion += visitas;
  }
  porCategoria[cat].totalRecurrentes += recurrentes;
  porCategoria[cat].totalShares += shares;
}

// Calcular promedios e imprimir comparativa
console.log('='.repeat(110));
console.log('COMPARATIVA POR TIPO DE APP');
console.log('='.repeat(110));
console.log(
  'Tipo'.padEnd(16) +
    'Apps en BD'.padEnd(12) +
    'Apps universo'.padEnd(15) +
    '%cobert'.padEnd(10) +
    'Visitas'.padEnd(10) +
    'V/app'.padEnd(8) +
    'Dur.avg(s)'.padEnd(12) +
    '%recurr'.padEnd(10) +
    'Shares'.padEnd(8)
);
console.log('-'.repeat(110));

const orden = ['simulador', 'estimador', 'calculadora', 'visualizador', 'orientador', 'planificador', 'test', 'curso', 'checklist', 'generador', 'conversor', 'guia', 'otro'];

const filas = [];
for (const cat of orden) {
  const data = porCategoria[cat];
  const universoCount = censoUniverso[cat] || 0;
  if (!data && universoCount === 0) continue;

  if (!data) {
    filas.push({ cat, appsBd: 0, universo: universoCount, cobert: 0, visitas: 0, vApp: 0, durAvg: 0, porcRec: 0, shares: 0 });
    continue;
  }

  const numApps = data.apps.length;
  const visitasMedia = numApps > 0 ? data.totalVisitas / numApps : 0;
  const duracionMedia = data.countDuracion > 0 ? data.sumDuracion / data.countDuracion : 0;
  const porcRecurrentes = data.totalVisitas > 0 ? (data.totalRecurrentes / data.totalVisitas) * 100 : 0;
  const cobertura = universoCount > 0 ? (numApps / universoCount) * 100 : 0;

  filas.push({
    cat,
    appsBd: numApps,
    universo: universoCount,
    cobert: cobertura,
    visitas: data.totalVisitas,
    vApp: visitasMedia,
    durAvg: duracionMedia,
    porcRec: porcRecurrentes,
    shares: data.totalShares,
  });
}

for (const f of filas) {
  console.log(
    f.cat.padEnd(16) +
      String(f.appsBd).padEnd(12) +
      String(f.universo).padEnd(15) +
      (f.cobert.toFixed(0) + '%').padEnd(10) +
      String(f.visitas).padEnd(10) +
      f.vApp.toFixed(1).padEnd(8) +
      f.durAvg.toFixed(0).padEnd(12) +
      (f.porcRec.toFixed(1) + '%').padEnd(10) +
      String(f.shares).padEnd(8)
  );
}

console.log('\n');

// Top 10 simuladores
console.log('='.repeat(80));
console.log('TOP 10 SIMULADORES POR VISITAS');
console.log('='.repeat(80));
const simuladoresOrdenados = (porCategoria.simulador?.apps || [])
  .sort((a, b) => b.visitas - a.visitas)
  .slice(0, 10);
for (const app of simuladoresOrdenados) {
  console.log(
    app.slug.padEnd(50) +
      String(app.visitas).padStart(6) + ' visitas  ' +
      String(app.duracion).padStart(4) + 's  ' +
      app.porcRecurrentes.toFixed(0).padStart(3) + '% rec'
  );
}

// Top 10 estimadores
console.log('\n' + '='.repeat(80));
console.log('TOP 10 ESTIMADORES POR VISITAS');
console.log('='.repeat(80));
const estimadoresOrdenados = (porCategoria.estimador?.apps || [])
  .sort((a, b) => b.visitas - a.visitas)
  .slice(0, 10);
for (const app of estimadoresOrdenados) {
  console.log(
    app.slug.padEnd(50) +
      String(app.visitas).padStart(6) + ' visitas  ' +
      String(app.duracion).padStart(4) + 's  ' +
      app.porcRecurrentes.toFixed(0).padStart(3) + '% rec'
  );
}

// Top 10 calculadoras
console.log('\n' + '='.repeat(80));
console.log('TOP 10 CALCULADORAS POR VISITAS');
console.log('='.repeat(80));
const calculadorasOrdenadas = (porCategoria.calculadora?.apps || [])
  .sort((a, b) => b.visitas - a.visitas)
  .slice(0, 10);
for (const app of calculadorasOrdenadas) {
  console.log(
    app.slug.padEnd(50) +
      String(app.visitas).padStart(6) + ' visitas  ' +
      String(app.duracion).padStart(4) + 's  ' +
      app.porcRecurrentes.toFixed(0).padStart(3) + '% rec'
  );
}

// Análisis de pareja: misma temática estimador vs simulador
console.log('\n' + '='.repeat(110));
console.log('ANÁLISIS DE PAREJAS (mismo tema, formato distinto)');
console.log('='.repeat(110));

const pairsTopic = {};
for (const cat of ['simulador', 'estimador', 'calculadora']) {
  for (const app of porCategoria[cat]?.apps || []) {
    // Extraer "tema" quitando el prefijo
    const tema = app.slug.replace(/^(simulador|estimador|calculadora)-/, '');
    if (!pairsTopic[tema]) pairsTopic[tema] = {};
    pairsTopic[tema][cat] = app;
  }
}

const parejasCompletas = Object.entries(pairsTopic)
  .filter(([_, formatos]) => Object.keys(formatos).length >= 2);

console.log(`\nTemas con 2+ formatos: ${parejasCompletas.length}\n`);
console.log('Tema'.padEnd(45) + 'Formato'.padEnd(15) + 'Visitas'.padEnd(10) + 'Dur(s)'.padEnd(8) + '%rec');
console.log('-'.repeat(95));

for (const [tema, formatos] of parejasCompletas.sort((a, b) => {
  const sumA = Object.values(a[1]).reduce((s, x) => s + x.visitas, 0);
  const sumB = Object.values(b[1]).reduce((s, x) => s + x.visitas, 0);
  return sumB - sumA;
}).slice(0, 30)) {
  for (const [cat, app] of Object.entries(formatos)) {
    console.log(
      tema.padEnd(45) +
        cat.padEnd(15) +
        String(app.visitas).padEnd(10) +
        String(app.duracion).padEnd(8) +
        app.porcRecurrentes.toFixed(0) + '%'
    );
  }
  console.log('-'.repeat(95));
}

// Estadística agregada de las parejas
console.log('\n' + '='.repeat(80));
console.log('PROMEDIO DE LAS PAREJAS (sólo en temas con 2+ formatos)');
console.log('='.repeat(80));
const stats = { simulador: { v: [], d: [], r: [] }, estimador: { v: [], d: [], r: [] }, calculadora: { v: [], d: [], r: [] } };
for (const [_, formatos] of parejasCompletas) {
  for (const [cat, app] of Object.entries(formatos)) {
    stats[cat].v.push(app.visitas);
    if (app.duracion > 0) stats[cat].d.push(app.duracion);
    stats[cat].r.push(app.porcRecurrentes);
  }
}
for (const cat of ['simulador', 'estimador', 'calculadora']) {
  const s = stats[cat];
  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  console.log(
    cat.padEnd(15) +
      'n=' + String(s.v.length).padEnd(6) +
      'visitas/app: ' + avg(s.v).toFixed(1).padStart(7) +
      '  dur(s): ' + avg(s.d).toFixed(0).padStart(4) +
      '  %rec: ' + avg(s.r).toFixed(1).padStart(5) + '%'
  );
}

console.log('\n[Análisis terminado]\n');
process.exit(0);
