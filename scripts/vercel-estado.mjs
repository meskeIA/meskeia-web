#!/usr/bin/env node
/**
 * Estado de meskeia-web en Vercel desde la línea de órdenes.
 *
 *   node scripts/vercel-estado.mjs              → últimos 10 despliegues
 *   node scripts/vercel-estado.mjs 25           → últimos 25
 *   node scripts/vercel-estado.mjs --logs       → logs de ejecución del último
 *   node scripts/vercel-estado.mjs --logs <id>  → logs de un despliegue concreto
 *
 * ⚠️ ESTADO DE --logs (probado el 19/08/2026, el mismo día de apagar Observability
 * Plus): el endpoint responde 200 pero NO emite un solo evento, ni siquiera con
 * tráfico provocado a propósito (12 peticiones a /api/analytics/track/ y
 * /api/divisas/ mientras escuchaba). No llega ni la marca «delimiter». La hipótesis
 * es que el almacén de runtime logs por API depende de Observability Plus, aunque la
 * tabla de límites solo hable de retención (Pro sin Plus: 1 día). Se deja escrito y
 * acotado —termina solo— para no repetir la investigación: si algún día se reactiva
 * Plus, la primera comprobación es volver a lanzarlo. Mientras tanto, lo que sirve
 * de este script es el listado de despliegues.
 *
 * Credenciales: VERCEL_TOKEN en .env.local (NUNCA se imprime). El token tiene
 * ámbito de PROYECTO, así que no alcanza recursos de equipo: la facturación y el
 * consumo NO se consultan desde aquí, solo desde el panel de Usage.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_LINEAS_LOG = 200;   // techo de entradas que imprimimos
const ESPERA_LOGS_MS = 20000; // el flujo no termina solo; ver verLogs()

// ─── Credenciales e identificadores ───────────────────────────────────────────

function valorDeEnv(clave) {
  const ruta = path.join(RAIZ, '.env.local');
  if (!fs.existsSync(ruta)) return null;
  const linea = fs.readFileSync(ruta, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.startsWith(`${clave}=`));
  return linea ? linea.slice(clave.length + 1).replace(/^["']|["']$/g, '').trim() : null;
}

const TOKEN = process.env.VERCEL_TOKEN || valorDeEnv('VERCEL_TOKEN');
if (!TOKEN) {
  console.error('✗ Falta VERCEL_TOKEN en .env.local.');
  console.error('  Se crea en vercel.com → Account Settings → Tokens, con ámbito «meskeia-web».');
  process.exit(1);
}

// Los identificadores salen de .vercel/repo.json, que `vercel link` deja en local
// y NO se versiona. Si algún día falta, se pueden fijar en .env.local.
function identificadores() {
  const projectId = process.env.VERCEL_PROJECT_ID || valorDeEnv('VERCEL_PROJECT_ID');
  const teamId = process.env.VERCEL_TEAM_ID || valorDeEnv('VERCEL_TEAM_ID');
  if (projectId && teamId) return { projectId, teamId };

  const ruta = path.join(RAIZ, '.vercel', 'repo.json');
  if (fs.existsSync(ruta)) {
    const repo = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    const p = (repo.projects || []).find((x) => x.name === 'meskeia-web') || (repo.projects || [])[0];
    if (p) return { projectId: p.id, teamId: p.orgId };
  }
  console.error('✗ No encuentro los identificadores del proyecto.');
  console.error('  Opciones: ejecutar `npx vercel link`, o añadir a .env.local');
  console.error('  VERCEL_PROJECT_ID y VERCEL_TEAM_ID (Project Settings → General).');
  process.exit(1);
}

const { projectId, teamId } = identificadores();
const cabeceras = { Authorization: `Bearer ${TOKEN}` };

async function api(ruta) {
  const union = ruta.includes('?') ? '&' : '?';
  const r = await fetch(`https://api.vercel.com${ruta}${union}teamId=${teamId}`, { headers: cabeceras });
  const cuerpo = await r.json();
  if (cuerpo.error) {
    console.error(`✗ La API respondió ${r.status}: ${cuerpo.error.code} — ${cuerpo.error.message}`);
    process.exit(1);
  }
  return cuerpo;
}

// ─── Formato ──────────────────────────────────────────────────────────────────

const fecha = (ms) => new Date(ms).toLocaleString('es-ES', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const SEMAFORO = {
  READY: '✅', ERROR: '❌', BUILDING: '🔨', QUEUED: '⏳', CANCELED: '⊘', INITIALIZING: '🔨',
};

// ─── Órdenes ──────────────────────────────────────────────────────────────────

async function listarDespliegues(limite = 10) {
  const { deployments = [] } = await api(`/v6/deployments?projectId=${projectId}&limit=${limite}`);
  if (!deployments.length) return console.log('No hay despliegues.');

  console.log(`\nÚltimos ${deployments.length} despliegues de meskeia-web:\n`);
  for (const d of deployments) {
    const titulo = (d.meta?.githubCommitMessage || '(sin mensaje)').split('\n')[0];
    const duracion = d.ready && d.buildingAt ? `${Math.round((d.ready - d.buildingAt) / 1000)} s` : '—';
    console.log(`${SEMAFORO[d.state] || '·'} ${fecha(d.created)}  ${String(duracion).padStart(6)}  ${titulo.slice(0, 62)}`);
    console.log(`   ${d.uid}`);
  }
  const fallidos = deployments.filter((d) => d.state === 'ERROR').length;
  console.log(fallidos ? `\n⚠️  ${fallidos} con error en esta ventana.\n` : '\nSin errores en esta ventana.\n');
}

async function verLogs(idDado) {
  let id = idDado;
  if (!id) {
    const { deployments = [] } = await api(`/v6/deployments?projectId=${projectId}&limit=1`);
    if (!deployments.length) return console.log('No hay despliegues.');
    id = deployments[0].uid;
    console.log(`Último despliegue: ${id} (${fecha(deployments[0].created)})`);
  }

  // OJO: este endpoint devuelve `application/stream+json` (NDJSON) y NO se cierra
  // solo — primero vuelca lo pasado y luego se queda escuchando en directo. Se corta
  // al recibir la marca {source:'delimiter'}, que separa el histórico del tiempo real,
  // y con una espera máxima por si esa marca no llega.
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA_LOGS_MS);
  const filas = [];

  try {
    const r = await fetch(
      `https://api.vercel.com/v1/projects/${projectId}/deployments/${id}/runtime-logs?teamId=${teamId}`,
      { headers: cabeceras, signal: control.signal },
    );
    if (!r.ok) {
      const detalle = r.status === 410 ? ' (los logs de este despliegue ya han caducado)' : '';
      console.error(`✗ La API respondió ${r.status}${detalle}.`);
      process.exit(1);
    }

    let resto = '';
    bucle: for await (const trozo of r.body) {
      resto += Buffer.from(trozo).toString('utf8');
      const lineas = resto.split('\n');
      resto = lineas.pop() ?? '';
      for (const linea of lineas) {
        if (!linea.trim()) continue;
        let evento;
        try { evento = JSON.parse(linea); } catch { continue; }
        if (evento.source === 'delimiter') break bucle;  // fin de lo pasado
        filas.push(evento);
        if (filas.length >= MAX_LINEAS_LOG) break bucle;
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  } finally {
    control.abort();
    clearTimeout(reloj);
  }

  if (!filas.length) {
    console.log('\nSin entradas. Puede ser que no haya habido peticiones o que la ventana');
    console.log('de retención (1 día sin Observability Plus) ya las haya descartado.\n');
    return;
  }

  console.log(`\n${filas.length} entradas:\n`);
  for (const l of filas) {
    const peticion = l.requestPath
      ? `${l.requestMethod || ''} ${l.requestPath} ${l.responseStatusCode || ''}`.trim()
      : '';
    console.log(`[${fecha(l.timestampInMs)}] ${String(l.level || '').padEnd(7)} ${peticion}`);
    if (l.message) console.log(`    ${String(l.message).slice(0, 200)}`);
  }
  console.log('');
}

// ─── Entrada ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('--logs')) {
  await verLogs(args[args.indexOf('--logs') + 1]);
} else {
  await listarDespliegues(Number(args[0]) || 10);
}
