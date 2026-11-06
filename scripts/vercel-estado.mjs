#!/usr/bin/env node
/**
 * Estado de meskeia-web en Vercel desde la línea de órdenes.
 *
 *   node scripts/vercel-estado.mjs              → últimos 10 despliegues
 *   node scripts/vercel-estado.mjs 25           → últimos 25
 *   node scripts/vercel-estado.mjs --logs       → logs de ejecución del último
 *   node scripts/vercel-estado.mjs --logs <id>  → logs de un despliegue concreto
 *   node scripts/vercel-estado.mjs --esperar    → espera a que termine el despliegue de lo
 *                                                 subido (origin/main) y sale con su veredicto
 *   node scripts/vercel-estado.mjs --esperar <sha> [--max <segundos>]
 *
 * --esperar (06/11/2026): el paso 5 de /push decía «esperar y repetir» sin herramienta, y
 * cada sesión improvisaba un bucle `until … | tail -1 | grep …`. El listado acababa con una
 * línea EN BLANCO, así que `tail -1` leía "" y el bucle se daba por terminado al primer
 * intento («terminó antes de tiempo por una lectura vacía»). Ahora la espera vive aquí, con
 * su temporizador, y el veredicto va en el CÓDIGO DE SALIDA, no en el texto:
 *   0 = READY · 1 = ERROR o CANCELED · 2 = tiempo agotado · 3 = no se puede esperar.
 * Espera al SHA de origin/main (lo que se subió), no a HEAD: otra conversación puede
 * commitear entre el push y la espera, y ese commit no lo va a desplegar nadie.
 * Un fallo de red o de la API durante la espera se reintenta; no la corta.
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

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_LINEAS_LOG = 200;   // techo de entradas que imprimimos
const ESPERA_LOGS_MS = 20000; // el flujo no termina solo; ver verLogs()
// Builds medidos 01-06/11/2026: 1 min 36 s a 3 min 20 s, más la cola. 8 min deja margen
// a un build frío sin quedarse colgado si el push nunca llega a Vercel.
const ESPERA_DEPLOY_S = 480;
const INTERVALO_DEPLOY_S = 15;

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

// Lanza en vez de salir: la espera reintenta un fallo pasajero; el listado lo convierte en salida 1
async function api(ruta) {
  const union = ruta.includes('?') ? '&' : '?';
  const r = await fetch(`https://api.vercel.com${ruta}${union}teamId=${teamId}`, { headers: cabeceras });
  const cuerpo = await r.json();
  if (cuerpo.error) throw new Error(`La API respondió ${r.status}: ${cuerpo.error.code} — ${cuerpo.error.message}`);
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

  // El commit de cierre de /push lleva SIEMPRE el mismo mensaje («refresca app-dates
  // del lote»): por el título no se distingue el push recién hecho del anterior, y
  // el 20/10/2026 se dio por verde el despliegue de 3 h antes mientras el nuevo, que
  // aún no salía en la lista, acabó en error. Lo que identifica el push es el SHA.
  let head = '';
  try {
    head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: RAIZ, encoding: 'utf8' }).trim();
  } catch { /* sin git: se lista sin la marca */ }

  console.log(`\nÚltimos ${deployments.length} despliegues de meskeia-web:\n`);
  for (const d of deployments) {
    const titulo = (d.meta?.githubCommitMessage || '(sin mensaje)').split('\n')[0];
    const duracion = d.ready && d.buildingAt ? `${Math.round((d.ready - d.buildingAt) / 1000)} s` : '—';
    const sha = d.meta?.githubCommitSha || '';
    const marca = head && sha === head ? '  ← HEAD local' : '';
    console.log(`${SEMAFORO[d.state] || '·'} ${fecha(d.created)}  ${String(duracion).padStart(6)}  ${sha.slice(0, 7) || '·······'}  ${titulo.slice(0, 54)}${marca}`);
    console.log(`   ${d.uid}`);
  }
  const fallidos = deployments.filter((d) => d.state === 'ERROR').length;
  console.log(fallidos ? `\n⚠️  ${fallidos} con error en esta ventana.` : '\nSin errores en esta ventana.');

  if (head) {
    // Manda el más reciente del commit local: un redespliegue en verde tapa el error anterior
    const delHead = deployments.find((d) => d.meta?.githubCommitSha === head);
    if (!delHead) console.log(`⏳ Ningún despliegue de HEAD (${head.slice(0, 7)}) todavía: el push aún no ha llegado a Vercel. No darlo por bueno.`);
    else if (delHead.state === 'READY') console.log(`✅ HEAD (${head.slice(0, 7)}) desplegado.`);
    else console.log(`${SEMAFORO[delHead.state] || '·'} HEAD (${head.slice(0, 7)}) en estado ${delHead.state}.`);
  }
  // Sin línea en blanco final: la del SHA tiene que ser la ÚLTIMA (ver cabecera, --esperar)
}

const ESTADOS_FINALES = { READY: 0, ERROR: 1, CANCELED: 1 };

async function esperarDespliegue(shaDado, maxSegundos) {
  let sha = shaDado;
  if (!sha) {
    try {
      sha = execFileSync('git', ['rev-parse', 'origin/main'], { cwd: RAIZ, encoding: 'utf8' }).trim();
    } catch {
      console.log('✗ No puedo leer origin/main. Pasa el SHA: --esperar <sha>.');
      process.exitCode = 3;
      return;
    }
  }
  const corto = sha.slice(0, 7);
  const inicio = Date.now();
  let ultimo = 'sin lectura';
  console.log(`Esperando al despliegue de ${corto} (máximo ${maxSegundos} s, cada ${INTERVALO_DEPLOY_S} s)…`);

  while ((Date.now() - inicio) / 1000 < maxSegundos) {
    try {
      const { deployments = [] } = await api(`/v6/deployments?projectId=${projectId}&limit=20`);
      // Prefijo, para admitir un SHA corto; manda el más reciente (un redespliegue tapa el error)
      const d = deployments.find((x) => (x.meta?.githubCommitSha || '').startsWith(sha));
      if (d && d.state in ESTADOS_FINALES) {
        const s = Math.round((Date.now() - inicio) / 1000);
        const duracion = d.ready && d.buildingAt ? `, build de ${Math.round((d.ready - d.buildingAt) / 1000)} s` : '';
        console.log(`${SEMAFORO[d.state]} ${corto} ${d.state === 'READY' ? 'desplegado' : `en estado ${d.state}`} (esperado ${s} s${duracion}) · ${d.uid}`);
        // exitCode y no exit(): en Windows, salir con un fetch recién cerrado aborta Node
        // (`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`, salida 127 en vez de 0)
        process.exitCode = ESTADOS_FINALES[d.state];
        return;
      }
      ultimo = d ? d.state : 'aún no aparece en Vercel';
    } catch (e) {
      ultimo = `lectura fallida, se reintenta (${e.message})`;
    }
    await new Promise((r) => setTimeout(r, INTERVALO_DEPLOY_S * 1000));
  }
  console.log(`⏳ ${corto}: tiempo agotado tras ${maxSegundos} s. Último estado: ${ultimo}. No darlo por bueno.`);
  process.exitCode = 2;
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
const valorTras = (opcion) => {
  const v = args[args.indexOf(opcion) + 1];
  return v && !v.startsWith('--') ? v : undefined;
};
try {
  if (args.includes('--esperar')) {
    await esperarDespliegue(valorTras('--esperar'), Number(valorTras('--max')) || ESPERA_DEPLOY_S);
  } else if (args.includes('--logs')) {
    await verLogs(valorTras('--logs'));
  } else {
    await listarDespliegues(Number(args[0]) || 10);
  }
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exitCode = 1;
}
