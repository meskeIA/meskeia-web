#!/usr/bin/env node
/**
 * ronda:hoy — el parte de la Ronda en cinco líneas, sin abrir el acta
 *
 * Ejecutar:  npm run ronda:hoy
 *
 * La Ronda corre sola cada mañana dentro de la Rutina Matinal y deja un acta de
 * decenas de páginas. Casi ningún día hay que leerla: lo único accionable es la línea
 * de NUEVAS. Esto la saca a la superficie para que mirarla cueste tres segundos, que
 * es la única forma de que se mire de verdad.
 *
 * Avisa además si el acta NO es de hoy: eso significa que la Ronda no llegó a correr,
 * y un vigilante que no corre es indistinguible de un catálogo sano si nadie mira la fecha.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(RAIZ, '_private', 'rondas');
const hoy = new Date().toISOString().slice(0, 10);

if (!fs.existsSync(DIR)) {
  console.log('\nLa Ronda no ha dejado ninguna acta todavía.\n');
  process.exit(0);
}

const actas = fs.readdirSync(DIR).filter(f => /^ronda-produccion-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
if (!actas.length) {
  console.log('\nNo hay ninguna acta de producción. ¿Ha corrido la Ronda alguna vez?\n');
  process.exit(0);
}

const ultima = actas[actas.length - 1];
const fecha = ultima.match(/(\d{4}-\d{2}-\d{2})/)[1];
const txt = fs.readFileSync(path.join(DIR, ultima), 'utf8');

const cabecera = (txt.match(/^(\d+) URLs revisadas en (\d+) s · \*\*(\d+) con error\*\* · (\d+) con aviso/m) || []).slice(1);
const comparacion = (txt.match(/^Frente a la ronda anterior: (\d+) nuevas · (\d+) resueltas · (\d+) persistentes/m) || []).slice(1);
const nuevas = [];
const bloque = txt.split('**Nuevas desde la última ronda**')[1];
if (bloque) for (const l of bloque.split('\n')) {
  if (l.startsWith('- ')) nuevas.push(l.slice(2).trim());
  else if (l.startsWith('#')) break;
}

const dias = Math.round((new Date(hoy) - new Date(fecha)) / 86400000);
console.log(`\nRonda del ${fecha}${dias === 0 ? ' (hoy)' : dias === 1 ? ' (ayer)' : ` — hace ${dias} días`}`);

if (dias >= 1) {
  console.log(`\n⚠  La Ronda no ha dejado acta de hoy. O no ha corrido, o no llegó a terminar.`);
  console.log(`   Comprobar con /log, o lanzarla a mano: npm run ronda -- --produccion\n`);
}

if (cabecera.length) {
  console.log(`   ${cabecera[0]} URLs · ${cabecera[2]} con error · ${cabecera[3]} con aviso`);
}
if (comparacion.length) {
  console.log(`   ${comparacion[0]} nuevas · ${comparacion[1]} resueltas · ${comparacion[2]} persistentes`);
}

if (nuevas.length) {
  console.log(`\n   NUEVAS — es lo único que hay que mirar:`);
  for (const n of nuevas) console.log(`     · ${n}`);
  console.log(`\n   Detalle: _private/rondas/${ultima}`);
} else if (comparacion.length) {
  console.log(`\n   Sin URLs nuevas rotas desde ayer.`);
}

/**
 * Antigüedad de cada hallazgo persistente, y si alguno ha sobrevivido a su reparación.
 *
 * El parte decía «N persistentes» y nada más, y esa cifra mezcla dos cosas que no se
 * parecen: lo que ya se conoce y está en cola, y lo que se dio por arreglado sin estarlo.
 * Siendo indistinguibles, «persistente» acabó leyéndose como «ruido conocido», y
 * /calendario-fiscal-emprendedor/ pasó siete rondas señalado (14→20/08/2026) después de que
 * el fix del 16/08 cerrase a sus otros nueve compañeros de lote y a él no: el gate se montó
 * a partir de la rejilla y dejó fuera el bloque de vencimientos, que también lee el reloj.
 * El dato para verlo ya estaba impreso el 17: «10 resueltas · 1 persistentes».
 *
 * El discriminador es barato y no depende de que nadie se acuerde: si la app se tocó y las
 * rondas POSTERIORES al commit siguen avisando, la reparación no cerró. Eso no es un
 * persistente conocido, es una novedad disfrazada de rutina.
 */
function hallazgosDe(texto) {
  const urls = new Set();
  for (const l of texto.split('\n')) {
    const aviso = l.match(/^- \*\*(\/[^*]+)\*\*/);   // sección Avisos
    if (aviso) { urls.add(aviso[1]); continue; }
    const error = l.match(/^### (\/\S*)/);           // sección Errores
    if (error) urls.add(error[1]);
  }
  return urls;
}

const esp = f => f.split('-').reverse().join('/');
const historico = actas.map(f => ({
  fecha: f.match(/(\d{4}-\d{2}-\d{2})/)[1],
  urls: hallazgosDe(fs.readFileSync(path.join(DIR, f), 'utf8')),
}));

const persistentes = [];
for (const url of hallazgosDe(txt)) {
  let rondas = 0, desde = fecha;
  for (let i = historico.length - 1; i >= 0; i--) {
    if (!historico[i].urls.has(url)) break;
    rondas++;
    desde = historico[i].fecha;
  }
  if (rondas < 2) continue;   // lo de un solo día ya sale arriba, como NUEVA

  let tocada = null;
  const rutaApp = 'app/' + url.replace(/^\/|\/$/g, '');
  if (url !== '/' && fs.existsSync(path.join(RAIZ, rutaApp))) {
    try {
      tocada = execFileSync('git', ['log', '-1', '--format=%ad', '--date=short',
        '--since', desde, '--', rutaApp], { cwd: RAIZ, encoding: 'utf8' }).trim() || null;
    } catch { /* sin git no hay cruce, pero el contador de rondas sigue valiendo */ }
  }
  const rondasTrasElArreglo = tocada ? historico.filter(a => a.fecha > tocada && a.urls.has(url)).length : 0;
  persistentes.push({ url, rondas, desde, tocada, rondasTrasElArreglo });
}

if (persistentes.length) {
  console.log(`\n   PERSISTENTES — con lo que lleva cada uno:`);
  for (const p of persistentes.sort((a, b) => b.rondas - a.rondas)) {
    console.log(`     · ${p.url} — ${p.rondas} rondas seguidas, desde el ${esp(p.desde)}`);
    if (p.rondasTrasElArreglo > 0) {
      console.log(`       AVISO: se tocó el ${esp(p.tocada)} y ha seguido avisando ${p.rondasTrasElArreglo} rondas.`);
      console.log(`       La reparación no cerró. Esto NO es un persistente conocido: mirarlo.`);
    } else if (p.tocada) {
      console.log(`       Reparada el ${esp(p.tocada)}; aún sin ronda posterior que lo confirme.`);
    }
  }
}

/**
 * Contador de veredicto repetido, impreso y no confiado a la memoria de nadie.
 * "Sin novedades" es la respuesta correcta casi todos los días, y precisamente por eso
 * deja de informar: a partir de cierto punto es indistinguible de una Ronda que mira mal.
 * El umbral es alto (15 días) porque aquí lo esperable ES la racha, al revés que en un
 * semáforo; lo que la rompe es cualquier cambio del catálogo, y se despliega casi a diario.
 */
let racha = 0;
for (let i = actas.length - 1; i >= 0; i--) {
  const t = fs.readFileSync(path.join(DIR, actas[i]), 'utf8');
  const m = t.match(/^Frente a la ronda anterior: (\d+) nuevas/m);
  if (!m) break;              // la primera acta no compara con nada
  if (m[1] === '0') racha++; else break;
}
if (racha >= 15) {
  console.log(`\n⚠  ${racha} rondas seguidas sin una sola novedad, habiendo desplegado en ese tiempo.`);
  console.log(`   La lectura por defecto ya no es que el catálogo esté sano, sino que la Ronda`);
  console.log(`   ha dejado de mirar. Comprobarlo: npm run ronda -- --autocomprobar`);
} else if (racha > 1) {
  console.log(`   (${racha} rondas seguidas sin novedades)`);
}
console.log('');
