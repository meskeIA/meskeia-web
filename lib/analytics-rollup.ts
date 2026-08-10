/**
 * Cómputo de las tablas de AGREGADOS (rollup) de analytics.
 *
 * Pre-calcula, por DÍA CERRADO, las métricas que el dashboard antes obtenía
 * escaneando la tabla cruda con GROUP BY/AVG (3-5 s por query, hasta 23 s en
 * frío). El día en curso NO se pre-agrega aquí: el router lo consulta en vivo.
 *
 * Fuente ÚNICA de la lógica de agregación: la usan el endpoint /api/analytics/rollup
 * (cron + on-demand) y el script de backfill (vía ese endpoint). La clasificación
 * de origen y la normalización de país replican EXACTAMENTE las de
 * server/routers/analytics.ts para garantizar paridad de números.
 */

import type { Client } from '@libsql/client';

// Plataformas IA conocidas — debe coincidir con getResumen (analytics.ts)
export const PLATAFORMAS_IA = [
  'claude.ai',
  'perplexity.ai',
  'chatgpt.com',
  'gemini.google.com',
  'copilot.microsoft.com',
  'you.com',
  'phind.com',
  'poe.com',
];

// Normalización de nombres de país completos → ISO alpha-2.
// Debe coincidir con el CASE de getStats (analytics.ts). Los registros nuevos ya
// llegan como ISO (x-vercel-ip-country); esto cubre históricos con nombre completo.
const NORMALIZAR_PAIS: Record<string, string> = {
  'Spain': 'ES', 'United States': 'US', 'Mexico': 'MX', 'Argentina': 'AR',
  'Colombia': 'CO', 'Bolivia': 'BO', 'Ecuador': 'EC', 'Chile': 'CL',
  'Peru': 'PE', 'Venezuela': 'VE', 'Guatemala': 'GT', 'Costa Rica': 'CR',
  'Honduras': 'HN', 'El Salvador': 'SV', 'Nicaragua': 'NI', 'Panama': 'PA',
  'Cuba': 'CU', 'Dominican Republic': 'DO', 'Puerto Rico': 'PR', 'Uruguay': 'UY',
  'Paraguay': 'PY', 'Brazil': 'BR', 'Portugal': 'PT', 'France': 'FR',
  'Germany': 'DE', 'United Kingdom': 'GB', 'Italy': 'IT', 'Netherlands': 'NL',
  'Belgium': 'BE', 'Switzerland': 'CH', 'Sweden': 'SE', 'Norway': 'NO',
  'Denmark': 'DK', 'Finland': 'FI', 'Poland': 'PL', 'Russia': 'RU',
  'Turkey': 'TR', 'Canada': 'CA', 'Australia': 'AU', 'Japan': 'JP',
  'China': 'CN', 'India': 'IN', 'South Korea': 'KR',
};

/** Convierte "DD/MM/YYYY, HH:MM:SS" → "YYYYMMDD" (clave fecha_ord), o null. */
export function timestampAFechaOrd(ts: string): string | null {
  const m = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return `${m[3]}${m[2].padStart(2, '0')}${m[1].padStart(2, '0')}`;
}

/** "YYYYMMDD" de hoy según hora local del servidor. */
export function hoyFechaOrd(d: Date = new Date()): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Fecha-hora ACTUAL en Europe/Madrid como Date "naive" (componentes Madrid
 * en la zona local del runtime). Los timestamps de uso_aplicaciones se escriben
 * en hora Madrid (track/route.ts), pero Vercel corre en UTC: sin esta conversión,
 * entre las 00:00 y las 01:00/02:00 hora española las ventanas "hoy"/"ayer" del
 * dashboard apuntaban al día anterior. Todas las ventanas temporales del router
 * deben partir de aquí, nunca de `new Date()` directo.
 */
export function ahoraMadrid(): Date {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(new Date());
  const v = (t: string) => Number(partes.find(p => p.type === t)?.value ?? 0);
  // Algunos motores devuelven "24" para medianoche con hour12:false
  const hora = v('hour') === 24 ? 0 : v('hour');
  return new Date(v('year'), v('month') - 1, v('day'), hora, v('minute'), v('second'));
}

/** Inicio del día de hoy en Europe/Madrid (00:00, Date naive). */
export function hoyMadrid(): Date {
  const a = ahoraMadrid();
  return new Date(a.getFullYear(), a.getMonth(), a.getDate());
}

/** Cap único de duración para todas las medias (30 min). Evita que pestañas
 *  olvidadas (hasta 51 h registradas) distorsionen los promedios. */
export const CAP_DUR = 1800;

/** Orígenes que cuentan como "visita con página" (universo U2, base de duración).
 *  Excluye mcp (llamada API sin página), ia-lectura (agente sin persona) y bot/propio. */
const U2_SET = new Set(['web', 'chatgpt', 'copilot', 'otras-ia', 'pwa', 'redes']);

/**
 * Agentes de IA que RENDERIZAN la página (ejecutan JavaScript) y por eso llegan al
 * tracker, a diferencia de los crawlers que solo hacen fetch del HTML. No son visitas:
 * no hay nadie mirando. Pero tampoco son bots en el sentido de "ruido a descartar" —
 * detrás hay una persona que metió la URL en su cuaderno y va a leer el contenido
 * mediado por la IA. Son la tercera especie del foso, y tienen fila propia.
 *
 * Firma medida sobre 295 registros de Google-NotebookLM (24/03→10/08/2026), sin una
 * sola excepción: 0% con duración registrada, 0% recurrentes, resolución idéntica
 * (412x732 · Linux armv8l) y 3 IPs de infraestructura de Google. Ninguna señal humana.
 *
 * Por qué NO van al foso junto a referral-ia/MCP: esas dos tienen a la persona AL OTRO
 * LADO —en referral-ia hizo clic, en MCP recibió la respuesta del cálculo—. Aquí la
 * persona recibe el TEXTO, no la app; en un simulador eso significa que se lleva la
 * EducationalSection y no puede llevarse el simulador. Sumarlos mediría dos cosas
 * distintas en la misma columna.
 *
 * Se compara contra `navegador` (navigator.userAgent del cliente), NO contra el UA de la
 * petición HTTP: NotebookLM renderiza con un headless cuyo UA de transporte es el de
 * Chrome, y por eso esquiva el `botsPattern` del endpoint de ingesta.
 */
const AGENTES_IA_LECTURA = /NotebookLM/i;

/**
 * Crawlers y agentes automatizados que se colaron como modo='web' en el histórico.
 * Se reclasifican en LECTURA, sin tocar la tabla cruda: el rollup es reconstruible
 * (?rebuild=1) y el UA original sigue intacto en `navegador` para auditar.
 *
 * Caso concreto: 253 registros de bingbot entre 18/12/2025 y 07/03/2026 contados como
 * tráfico humano en el acumulado del Resumen por Origen. La ingesta ya los ataja desde
 * entonces (`botsPattern` en track/route.ts caza el UA HTTP), así que esto es
 * saneamiento del pasado, no una defensa activa — pero la clase queda cerrada por si
 * otro agente vuelve a presentar un UA de cliente distinto del de transporte.
 */
const CRAWLERS_UA =
  /bingbot|Googlebot|Google-InspectionTool|AdsBot-Google|Slurp|DuckDuckBot|Baiduspider|YandexBot|Bytespider|PetalBot|AhrefsBot|SemrushBot|MJ12bot|DotBot|facebookexternalhit|meta-externalagent|Applebot|Amazonbot|GPTBot|OAI-SearchBot|ClaudeBot|anthropic-ai|PerplexityBot|Diffbot|Screaming Frog/i;

/** true si el UA de cliente es un agente de IA que renderiza para leer el contenido. */
export function esAgenteIALectura(navegador: string | null): boolean {
  return !!navegador && AGENTES_IA_LECTURA.test(navegador);
}

/**
 * Clientes MCP que se identifican con nombre y por tanto cuentan como canal IA real.
 * Lo que no esté aquí se clasifica como 'bot': sondeadores, escáneres y scrapers.
 *
 * Lista BLANCA y no lista negra de UA sospechosos (30/07/2026): el 29/07 un sondeador
 * hizo 53 tools/call a Delegum en 17 min con UA `Mozilla/5.0 (compatible;
 * mcp-schema-probe/0.1)` —egress de Cloudflare rotando PoPs, argumentos válidos
 * generados del JSON Schema de cada tool— y esquivó `MCP_AUTOMATION_UA` del endpoint
 * de ingesta, que caza LIBRERÍAS (python-httpx, curl, axios…) pero no un nombre
 * inventado con envoltorio Mozilla. Una lista negra cerraría ese caso y dejaría abierta
 * la clase: el próximo escáner llamado `helper/1.0` volvería a colarse. Los clientes
 * reales SÍ se presentan — el 16/07/2026 quedaron registrados los tres de abajo.
 *
 * Se clasifica AQUÍ y no en la ingesta a propósito: el rollup es una capa derivada y
 * reconstruible (?rebuild=1), así que la tabla cruda conserva `uaCliente` intacto y
 * cualquier lectura futura puede seguir distinguiendo. Marcarlo en el INSERT sería
 * irreversible, y con una lista blanca en escritura el primer uso de un cliente MCP
 * nuevo quedaría sellado como bot para siempre: justo la adopción que se quiere medir.
 *
 * ⚠️ Esta lista está REPLICADA a mano en tres sitios más (no hay forma limpia de
 * compartirla entre .ts y los .mjs de análisis). Al añadir un cliente, actualizar:
 *   · scripts/rollup-verify.mjs   (si no, el verificador reporta descuadre falso)
 *   · scripts/analizar-ia-paginas.mjs
 *   · scripts/digest-diario.mjs   (const MCP_CLIENTES_IA — fuera del repo, gitignored)
 */
const MCP_CLIENTES_IA = /^(Claude-User|openai-mcp|MistralAI-MCPClient)/i;

/**
 * true si una fila con modo='mcp' viene de un cliente IA identificado.
 * Exportada para que TODO el lado TypeScript comparta una sola implementación:
 * la usan clasificarOrigenReal (agregados) y mapearRegistro (tabla de registros
 * del dashboard). Si divergieran, el dashboard contaría una cosa en el Resumen IA
 * y otra en Últimos Registros — que es exactamente lo que pasó el 30/07/2026.
 */
export function mcpEsClienteIdentificado(datosAd: Record<string, unknown> | null): boolean {
  const ua = typeof datosAd?.uaCliente === 'string' ? datosAd.uaCliente : '';
  return MCP_CLIENTES_IA.test(ua);
}

/**
 * Clasifica el origen REAL del registro (sin considerar si es propio).
 * Modelo unificado: web / chatgpt / copilot / otras-ia / mcp / pwa / redes / ia-lectura / bot.
 * Limpia el modo espurio 'chatgpt' y agrupa las plataformas IA sin volumen en 'otras-ia'.
 *
 * El UA de cliente manda sobre el modo: un agente identificado sale de 'web' (o de 'bot',
 * donde lo deja la ingesta) hacia su categoría real. Se hace AQUÍ y no en el INSERT por
 * el mismo motivo que la lista blanca de MCP: esta capa es derivada y reconstruible,
 * así que un criterio equivocado se corrige con ?rebuild=1 en vez de quedar sellado.
 */
function clasificarOrigenReal(
  modo: string,
  datosAd: Record<string, unknown> | null,
  navegador: string | null = null
): string {
  // Agentes de IA que renderizan: categoría propia, ni visita ni bot (ver AGENTES_IA_LECTURA).
  // Se evalúa ANTES que 'bot' porque la ingesta ya los marca así para que los ~10 filtros
  // SQL de `modo` los excluyan sin tener que tocarlos uno a uno.
  if (esAgenteIALectura(navegador)) return 'ia-lectura';
  if (modo === 'bot') return 'bot';
  // Crawlers que quedaron como 'web' en el histórico (bingbot y compañía).
  if (navegador && CRAWLERS_UA.test(navegador)) return 'bot';
  // Solo cuenta como canal IA si el cliente dice quién es (ver MCP_CLIENTES_IA).
  if (modo === 'mcp') return mcpEsClienteIdentificado(datosAd) ? 'mcp' : 'bot';
  if (modo === 'chatgpt') return 'chatgpt'; // modo espurio legacy → IA ChatGPT
  if (modo === 'referral-ia') {
    const ref = (datosAd?.referrer_ia as string) || null;
    if (ref === 'chatgpt.com') return 'chatgpt';
    if (ref === 'copilot.microsoft.com') return 'copilot';
    return 'otras-ia';
  }
  if (modo === 'pwa') return 'pwa';
  if (modo === 'referral-social') return 'redes';
  return 'web';
}

// ── Acumuladores en memoria ────────────────────────────────────────────────
// Conteos en universo U1 (tráfico real, excluye bots; propio por dimensión).
// Duración con cap 1800 (U2 emerge solo: bot/mcp tienen duración nula).
// Buckets b_* en universo U2 (con página): excluyen mcp explícitamente.
export type GlobalAcc = {
  usos: number; movil: number; escritorio: number;
  recurrentes: number; nuevos: number;
  suma_dur: number; count_dur: number; por_compartir: number;
  b_sinreg: number; b_rebote: number; b_corta: number; b_media: number; b_larga: number;
  sesiones: number; // nº de sesiones distintas del día (se rellena al final)
};
export type AppAcc = { usos: number; suma_dur_cap: number; count_dur_cap: number; max_dur: number };

/** Resultado de agregar registros: mapas por fecha_ord → es_miip(0|1) → datos. */
export type RollupMaps = {
  gMap: Map<string, [GlobalAcc, GlobalAcc]>;
  appMap: Map<string, [Map<string, AppAcc>, Map<string, AppAcc>]>;
  paisMap: Map<string, [Map<string, number>, Map<string, number>]>;
  ciudadMap: Map<string, [Map<string, number>, Map<string, number>]>;
  origenMap: Map<string, Map<string, number>>; // sin es_miip
};

export const nuevoGlobal = (): GlobalAcc => ({
  usos: 0, movil: 0, escritorio: 0, recurrentes: 0, nuevos: 0,
  suma_dur: 0, count_dur: 0, por_compartir: 0,
  b_sinreg: 0, b_rebote: 0, b_corta: 0, b_media: 0, b_larga: 0,
  sesiones: 0,
});

/** Expresión SQL que reordena el timestamp "DD/MM/YYYY,…" a "YYYYMMDD". */
export const FECHA_EXPR = `substr(timestamp,7,4)||substr(timestamp,4,2)||substr(timestamp,1,2)`;

/** Campos crudos mínimos que necesita la agregación. */
export const CAMPOS_ROLLUP =
  `timestamp, tipo_dispositivo, es_recurrente, duracion_segundos, ip_address, pais, ciudad, modo, aplicacion, datos_adicionales, es_propio, sesion_id, navegador`;

/**
 * Agrega un conjunto de registros crudos en los mapas del rollup.
 * Lógica ÚNICA compartida por el cómputo de días cerrados (computarRollupRango)
 * y por la ventana viva [ayer, hoy] del router → garantiza paridad de números.
 */
export function agregarRegistros(
  rows: Iterable<Record<string, unknown>>,
  ipExcluida: string
): RollupMaps {
  const gMap: RollupMaps['gMap'] = new Map();
  const appMap: RollupMaps['appMap'] = new Map();
  const paisMap: RollupMaps['paisMap'] = new Map();
  const ciudadMap: RollupMaps['ciudadMap'] = new Map();
  const origenMap: RollupMaps['origenMap'] = new Map();
  // Sesiones distintas por (fecha, idx) — para getTendencias (aproximación)
  const sesSets = new Map<string, [Set<string>, Set<string>]>();

  for (const row of rows) {
    const ts = String(row.timestamp || '');
    const fechaOrd = timestampAFechaOrd(ts);
    if (!fechaOrd) continue;

    const ip = String(row.ip_address || '');
    const dispositivo = String(row.tipo_dispositivo || '');
    const recurrente = Number(row.es_recurrente) === 1;
    const durRaw = row.duracion_segundos;
    const dur = durRaw === null || durRaw === undefined ? null : Number(durRaw);
    const modo = String(row.modo || 'web');
    const app = String(row.aplicacion || '');
    const rawDatos = row.datos_adicionales ? String(row.datos_adicionales) : '';
    let datosAd: Record<string, unknown> | null = null;
    if (rawDatos) { try { datosAd = JSON.parse(rawDatos); } catch { /* ignorar */ } }

    // Criterio unificado de "visita propia": es_propio=1 OR IP del propietario
    const propio = Number(row.es_propio) === 1 || (!!ipExcluida && ip === ipExcluida);
    const navegador = row.navegador == null ? null : String(row.navegador);
    const origenReal = clasificarOrigenReal(modo, datosAd, navegador);

    // ── Origen para getResumen: prioridad propio > bot > resto ──
    const origenResumen = propio ? 'propio' : origenReal;
    if (!origenMap.has(fechaOrd)) origenMap.set(fechaOrd, new Map());
    const ob = origenMap.get(fechaOrd)!;
    ob.set(origenResumen, (ob.get(origenResumen) || 0) + 1);

    // Conteos U1 (tráfico real): excluir bots no-propios y, siempre, la lectura por
    // agente de IA. `ia-lectura` sale de TODAS las métricas de visita —usos, ranking de
    // apps, países, recurrencia, sesiones— porque no hubo nadie en la página; su sitio
    // es la fila propia del Resumen por Origen, que se llenó unas líneas más arriba.
    // Sin esta salida, las 183 lecturas/30d de NotebookLM seguirían contando como
    // visitantes de EEUU con 0% de recurrencia, tirando de esas dos métricas.
    if (origenReal === 'ia-lectura') continue;
    if (origenReal === 'bot' && !propio) continue;
    const idx: 0 | 1 = propio ? 1 : 0;
    const durCap = dur !== null ? Math.min(dur, CAP_DUR) : null;

    // ── Global ──
    if (!gMap.has(fechaOrd)) gMap.set(fechaOrd, [nuevoGlobal(), nuevoGlobal()]);
    const g = gMap.get(fechaOrd)![idx];
    g.usos++;
    if (dispositivo === 'movil') g.movil++;
    else if (dispositivo === 'escritorio') g.escritorio++;
    if (recurrente) g.recurrentes++; else g.nuevos++;
    if (durCap !== null) { g.suma_dur += durCap; g.count_dur++; }
    if (rawDatos.includes('"ref":"share"')) g.por_compartir++;

    // Sesiones distintas del día (para getTendencias)
    const sesId = String(row.sesion_id || '');
    if (sesId !== '') {
      if (!sesSets.has(fechaOrd)) sesSets.set(fechaOrd, [new Set(), new Set()]);
      sesSets.get(fechaOrd)![idx].add(sesId);
    }

    // ── Buckets de duración (universo U2: con página; excluye mcp) ──
    if (U2_SET.has(origenReal)) {
      if (dur === null) g.b_sinreg++;
      else if (dur <= 30) g.b_rebote++;
      else if (dur <= 120) g.b_corta++;
      else if (dur <= 600) g.b_media++;
      else g.b_larga++;
    }

    // ── App (ranking + topPorDuracion; duración con cap 1800, max real) ──
    if (!appMap.has(fechaOrd)) appMap.set(fechaOrd, [new Map(), new Map()]);
    const appBucket = appMap.get(fechaOrd)![idx];
    let a = appBucket.get(app);
    if (!a) { a = { usos: 0, suma_dur_cap: 0, count_dur_cap: 0, max_dur: 0 }; appBucket.set(app, a); }
    a.usos++;
    if (dur !== null) { a.suma_dur_cap += Math.min(dur, CAP_DUR); a.count_dur_cap++; if (dur > a.max_dur) a.max_dur = dur; }

    // ── País / Ciudad (U1, ISO normalizado, solo válidos) ──
    const pais = String(row.pais || '');
    if (pais !== '') {
      const paisIso = NORMALIZAR_PAIS[pais] ?? pais;
      if (!paisMap.has(fechaOrd)) paisMap.set(fechaOrd, [new Map(), new Map()]);
      const pb = paisMap.get(fechaOrd)![idx];
      pb.set(paisIso, (pb.get(paisIso) || 0) + 1);
    }
    const ciudad = String(row.ciudad || '');
    if (ciudad !== '') {
      if (!ciudadMap.has(fechaOrd)) ciudadMap.set(fechaOrd, [new Map(), new Map()]);
      const cb = ciudadMap.get(fechaOrd)![idx];
      cb.set(ciudad, (cb.get(ciudad) || 0) + 1);
    }
  }

  // Volcar el nº de sesiones distintas a cada GlobalAcc
  for (const [fecha, sets] of sesSets) {
    const pair = gMap.get(fecha);
    if (!pair) continue;
    pair[0].sesiones = sets[0].size;
    pair[1].sesiones = sets[1].size;
  }

  return { gMap, appMap, paisMap, ciudadMap, origenMap };
}

/**
 * Computa el rollup para el rango [desdeOrd, hastaOrd] (ambos YYYYMMDD, inclusive).
 * Idempotente: borra las filas previas de esos días y reinserta. Marca rollup_control.
 * Devuelve la lista de fecha_ord efectivamente procesadas (días con datos).
 */
export async function computarRollupRango(
  client: Client,
  desdeOrd: string,
  hastaOrd: string,
  ipExcluida: string
): Promise<string[]> {
  const res = await client.execute({
    sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ? AND ${FECHA_EXPR} <= ?`,
    args: [desdeOrd, hastaOrd],
  });

  const { gMap, appMap, paisMap, ciudadMap, origenMap } = agregarRegistros(res.rows, ipExcluida);
  const diasConDatos = Array.from(gMap.keys()).sort();

  // ── Persistir: borrar el rango (idempotencia) + insertar agregados en lotes ──
  const stmts: { sql: string; args: (string | number)[] }[] = [];

  // Borrado idempotente de todo el rango pedido (no solo días con datos)
  for (const tabla of ['rollup_dia', 'rollup_dia_origen', 'rollup_dia_app', 'rollup_dia_pais', 'rollup_dia_ciudad', 'rollup_control']) {
    stmts.push({
      sql: `DELETE FROM ${tabla} WHERE fecha_ord >= ? AND fecha_ord <= ?`,
      args: [desdeOrd, hastaOrd],
    });
  }

  for (const [fecha, pair] of gMap) {
    for (let miip = 0 as 0 | 1; miip <= 1; miip = (miip + 1) as 0 | 1) {
      const g = pair[miip];
      if (g.usos === 0) continue;
      stmts.push({
        sql: `INSERT INTO rollup_dia (fecha_ord, es_miip, usos, movil, escritorio, recurrentes, nuevos, suma_dur, count_dur, por_compartir, b_sinreg, b_rebote, b_corta, b_media, b_larga, sesiones)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [fecha, miip, g.usos, g.movil, g.escritorio, g.recurrentes, g.nuevos, g.suma_dur, g.count_dur, g.por_compartir, g.b_sinreg, g.b_rebote, g.b_corta, g.b_media, g.b_larga, g.sesiones],
      });
    }
  }
  for (const [fecha, pair] of appMap) {
    for (let miip = 0 as 0 | 1; miip <= 1; miip = (miip + 1) as 0 | 1) {
      for (const [app, a] of pair[miip]) {
        stmts.push({
          sql: `INSERT INTO rollup_dia_app (fecha_ord, es_miip, aplicacion, usos, suma_dur_cap, count_dur_cap, max_dur)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [fecha, miip, app, a.usos, a.suma_dur_cap, a.count_dur_cap, a.max_dur],
        });
      }
    }
  }
  for (const [fecha, pair] of paisMap) {
    for (let miip = 0 as 0 | 1; miip <= 1; miip = (miip + 1) as 0 | 1) {
      for (const [pais, usos] of pair[miip]) {
        stmts.push({ sql: `INSERT INTO rollup_dia_pais (fecha_ord, es_miip, pais, usos) VALUES (?, ?, ?, ?)`, args: [fecha, miip, pais, usos] });
      }
    }
  }
  for (const [fecha, pair] of ciudadMap) {
    for (let miip = 0 as 0 | 1; miip <= 1; miip = (miip + 1) as 0 | 1) {
      for (const [ciudad, usos] of pair[miip]) {
        stmts.push({ sql: `INSERT INTO rollup_dia_ciudad (fecha_ord, es_miip, ciudad, usos) VALUES (?, ?, ?, ?)`, args: [fecha, miip, ciudad, usos] });
      }
    }
  }
  for (const [fecha, ob] of origenMap) {
    for (const [origen, usos] of ob) {
      stmts.push({ sql: `INSERT INTO rollup_dia_origen (fecha_ord, origen, usos) VALUES (?, ?, ?)`, args: [fecha, origen, usos] });
    }
  }
  // Marcar TODOS los días del rango como computados (incluidos los sin datos:
  // así no se reintentan eternamente). computado_at por defecto.
  for (const fecha of enumerarDias(desdeOrd, hastaOrd)) {
    stmts.push({ sql: `INSERT INTO rollup_control (fecha_ord) VALUES (?)`, args: [fecha] });
  }

  // Ejecutar en lotes para no saturar un único batch
  const LOTE = 500;
  for (let i = 0; i < stmts.length; i += LOTE) {
    await client.batch(stmts.slice(i, i + LOTE), 'write');
  }

  return diasConDatos;
}

/**
 * Recalcula las tablas ACUMULADAS (all-time) desde las diarias.
 * Se ejecuta en background (cron/backfill), donde el coste del GROUP BY no afecta
 * a la latencia del dashboard. DELETE + INSERT...SELECT (idempotente).
 */
export async function derivarAcumulados(client: Client): Promise<void> {
  await client.batch([
    `DELETE FROM rollup_app_acum`,
    `INSERT INTO rollup_app_acum (aplicacion, es_miip, usos, suma_dur_cap, count_dur_cap, ultimo_ord, max_dur)
       SELECT aplicacion, es_miip, SUM(usos), SUM(suma_dur_cap), SUM(count_dur_cap), MAX(fecha_ord), MAX(max_dur)
       FROM rollup_dia_app GROUP BY aplicacion, es_miip`,
    `DELETE FROM rollup_pais_acum`,
    `INSERT INTO rollup_pais_acum (pais, es_miip, usos)
       SELECT pais, es_miip, SUM(usos) FROM rollup_dia_pais GROUP BY pais, es_miip`,
    `DELETE FROM rollup_ciudad_acum`,
    `INSERT INTO rollup_ciudad_acum (ciudad, es_miip, usos)
       SELECT ciudad, es_miip, SUM(usos) FROM rollup_dia_ciudad GROUP BY ciudad, es_miip`,
  ], 'write');
}

/** Enumera los días YYYYMMDD entre desde y hasta (inclusive). */
function enumerarDias(desdeOrd: string, hastaOrd: string): string[] {
  const toDate = (o: string) => new Date(Number(o.slice(0, 4)), Number(o.slice(4, 6)) - 1, Number(o.slice(6, 8)));
  const dias: string[] = [];
  const d = toDate(desdeOrd);
  const fin = toDate(hastaOrd);
  while (d <= fin) {
    dias.push(hoyFechaOrd(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

/**
 * Límite superior de días que se consideran "cerrados" para el rollup.
 * Es ANTEAYER (hoy-2), no ayer: aunque las fechas ya se calculan en hora Madrid
 * (ahoraMadrid), el margen de 1 día se mantiene como defensa ante cualquier
 * registro rezagado (beforeunload tardío, reintentos). El router consulta
 * [ayer, hoy] en vivo, así que el usuario siempre ve esos dos días al día.
 */
export function limiteCerradoOrd(d: Date = hoyMadrid()): string {
  const x = new Date(d);
  x.setDate(x.getDate() - 2);
  return hoyFechaOrd(x);
}

/**
 * Computa los días CERRADOS (≤ anteayer) que aún no estén en rollup_control.
 * Usado por el cron y el on-demand defensivo. Devuelve nº de días procesados.
 * `maxDias` acota el trabajo por invocación (lotes de backfill).
 */
export async function computarRollupPendientes(
  client: Client,
  ipExcluida: string,
  maxDias = 400
): Promise<{ procesados: number; desde: string | null; hasta: string | null }> {
  const tope = limiteCerradoOrd(); // anteayer

  // Último día ya computado (tabla pequeña → barato). Es el camino habitual:
  // si ya estamos al día, salimos con UNA sola query, sin tocar la tabla cruda.
  const lastRes = await client.execute(
    `SELECT MAX(fecha_ord) AS m FROM rollup_control WHERE fecha_ord <= ?`,
    [tope]
  );
  const lastOrd = lastRes.rows[0]?.m ? String(lastRes.rows[0].m) : null;

  let desde: string;
  if (lastOrd) {
    if (lastOrd >= tope) return { procesados: 0, desde: null, hasta: null }; // al día
    const d = new Date(Number(lastOrd.slice(0, 4)), Number(lastOrd.slice(4, 6)) - 1, Number(lastOrd.slice(6, 8)));
    d.setDate(d.getDate() + 1);
    desde = hoyFechaOrd(d);
  } else {
    // Primera vez (rollup_control vacío): arrancar desde el día más antiguo con datos
    const minRes = await client.execute(
      `SELECT MIN(substr(timestamp,7,4)||substr(timestamp,4,2)||substr(timestamp,1,2)) AS m FROM uso_aplicaciones`
    );
    const minOrd = minRes.rows[0]?.m ? String(minRes.rows[0].m) : null;
    if (!minOrd) return { procesados: 0, desde: null, hasta: null };
    desde = minOrd;
  }
  if (desde > tope) return { procesados: 0, desde: null, hasta: null }; // nada pendiente

  // Acotar a maxDias días por invocación
  const todos = enumerarDias(desde, tope);
  const lote = todos.slice(0, maxDias);
  const hasta = lote[lote.length - 1];

  await computarRollupRango(client, desde, hasta, ipExcluida);
  await derivarAcumulados(client);
  return { procesados: lote.length, desde, hasta };
}

/** Lee la IP excluida de analytics_config (o '' si no hay). */
export async function leerIpExcluida(client: Client): Promise<string> {
  try {
    const r = await client.execute({
      sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
      args: [],
    });
    return r.rows.length > 0 ? String(r.rows[0].valor) : '';
  } catch {
    return '';
  }
}
