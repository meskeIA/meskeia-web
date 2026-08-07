/**
 * Router de Analytics para tRPC
 * Migra la lógica de /api/analytics/* a procedures type-safe
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { getTursoClient, initializeDatabase, formatearDuracion } from '@/lib/turso';
import {
  agregarRegistros,
  computarRollupPendientes,
  leerIpExcluida,
  nuevoGlobal,
  ahoraMadrid,
  hoyMadrid,
  mcpEsClienteIdentificado,
  CAMPOS_ROLLUP,
  FECHA_EXPR,
  type GlobalAcc,
} from '@/lib/analytics-rollup';
import { STEMUM_APP_SLUGS } from '@/data/stemum';
import { COQUINUM_APP_SLUGS } from '@/data/coquinum';
import { DELEGUM_APP_SLUGS } from '@/data/delegum/soluciones';

// ── Adjudicación app → vertical temático (para la subdivisión de meskeia.com en
// getPorDominio). Cada app cae en UN solo cubo, por prioridad. Los cuatro
// verticales usan su LISTA CURADA propia (el conjunto de apps que cada portal
// reclama como suyas): Cronicum por el prefijo de ruta de las cronologías;
// Stemum/Coquinum por sus sets de portal; Delegum por la lista de su página de
// Soluciones (data/delegum/soluciones.ts). ──
function verticalDe(app: string): 'cronicum' | 'stemum' | 'coquinum' | 'delegum' | 'resto' {
  if (app.startsWith('visualizador-historia-')) return 'cronicum';
  if (STEMUM_APP_SLUGS.has(app)) return 'stemum';
  if (COQUINUM_APP_SLUGS.has(app)) return 'coquinum';
  if (DELEGUM_APP_SLUGS.has(app)) return 'delegum';
  return 'resto';
}

/**
 * Convierte una fila cruda de uso_aplicaciones en un registro tipado para el
 * frontend (sin `any`, con parse seguro de datos_adicionales).
 */
function mapearRegistro(row: Record<string, unknown>) {
  let datosAd: (Record<string, unknown> & { share_emit?: string }) | null = null;
  if (row.datos_adicionales) {
    try { datosAd = JSON.parse(String(row.datos_adicionales)); } catch { datosAd = null; }
  }
  return {
    id: Number(row.id),
    aplicacion: String(row.aplicacion ?? ''),
    timestamp: String(row.timestamp ?? ''),
    duracion_segundos: row.duracion_segundos == null ? null : Number(row.duracion_segundos),
    pais: row.pais == null ? null : String(row.pais),
    ciudad: row.ciudad == null ? null : String(row.ciudad),
    tipo_dispositivo: row.tipo_dispositivo == null ? null : String(row.tipo_dispositivo),
    navegador: row.navegador == null ? null : String(row.navegador),
    sistema_operativo: row.sistema_operativo == null ? null : String(row.sistema_operativo),
    resolucion: row.resolucion == null ? null : String(row.resolucion),
    // MCP anónimo se presenta como 'bot', la MISMA clasificación que usa el resto del
    // dashboard (Resumen IA, por dominio, subdivisión por tema). Antes esta tabla era el
    // único sitio que mostraba el `modo` CRUDO, y el 30/07/2026 eso llevó al usuario a
    // leer «IA / MCP (68)» en el chip de filtro como 68 adopciones de IA cuando el
    // Resumen IA decía 3: las 68 eran una ráfaga del sondeador mcp-schema-probe/0.1.
    // La columna se llama «Origen», no «modo»: debe decir de dónde viene de verdad. El
    // dato crudo sigue intacto en Turso y en datos_adicionales.uaCliente, que viaja aquí.
    modo: modoOrigen(row.modo == null ? 'web' : String(row.modo), datosAd),
    datos_adicionales: datosAd,
  };
}

/** 'mcp' solo si el cliente se identifica; si no, es un agente anónimo → 'bot'. */
function modoOrigen(modo: string, datosAd: Record<string, unknown> | null): string {
  if (modo === 'mcp' && !mcpEsClienteIdentificado(datosAd)) return 'bot';
  return modo;
}

/**
 * Helper: Anonimizar IP (RGPD compliance)
 */
function anonymizeIP(ip: string): string {
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return parts.slice(0, 3).join(':') + '::';
    }
  }
  return 'anonymous';
}

/**
 * Helper: Obtener IP real del request desde headers
 * Lee x-forwarded-for (Vercel/proxies) o x-real-ip, luego anonimiza
 */
function getClientIPFromRequest(req: Request | undefined): string {
  if (!req) return 'unknown';
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return anonymizeIP(forwarded.split(',')[0].trim());
  const realIP = req.headers.get('x-real-ip');
  if (realIP) return anonymizeIP(realIP);
  return 'unknown';
}

/**
 * Cálculo de getStats vía AGREGADOS (rollup) — ruta rápida del dashboard.
 *
 * Combina los días CERRADOS (≤ anteayer, pre-agregados en rollup_*) con la
 * ventana VIVA [ayer, hoy] (consultada en directo, pocas filas). Devuelve el
 * MISMO shape que la ruta en vivo original. Solo se usa cuando no hay filtros de
 * aplicación/fecha (el caso del dashboard); con filtros se mantiene el cálculo
 * en vivo. ipConfigurada es la IP del propietario (de config), usada SIEMPRE para
 * clasificar; excluir_mi_ip decide solo si se leen las filas es_miip=1.
 */
async function getStatsPorRollup(
  client: ReturnType<typeof getTursoClient>,
  input: { limite: number; excluir_mi_ip: boolean },
  ipConfigurada: string
) {
  const { limite, excluir_mi_ip } = input;
  const ipExcluida = excluir_mi_ip ? ipConfigurada : '';
  const soloResto = !!(excluir_mi_ip && ipConfigurada); // excluir es_miip=1
  const miipWhere = soloResto ? ' AND es_miip = 0' : '';
  const miipList: (0 | 1)[] = soloResto ? [0] : [0, 1];

  // On-demand defensivo: rellenar huecos de días cerrados (acotado para no bloquear)
  try { await computarRollupPendientes(client, ipConfigurada, 7); } catch { /* no bloquear la lectura */ }

  // Fechas en hora Madrid (los timestamps se escriben en Europe/Madrid).
  // Ventanas semanales SIN solape: "últimos 7 días" = [hoy-6, hoy] y
  // "semana anterior" = [hoy-13, hoy-7] — 7 días naturales cada una.
  const hoy = hoyMadrid();
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const anteayer = new Date(hoy); anteayer.setDate(hoy.getDate() - 2);
  const hace6 = new Date(hoy); hace6.setDate(hoy.getDate() - 6);
  const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7);
  const hace13 = new Date(hoy); hace13.setDate(hoy.getDate() - 13);
  const hace29 = new Date(hoy); hace29.setDate(hoy.getDate() - 29); // ventana 30d del ranking
  const iMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const iMesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fMesAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const ord = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const hoyOrd = ord(hoy), ayerOrd = ord(ayer), anteayerOrd = ord(anteayer);
  const hace6Ord = ord(hace6), hace7Ord = ord(hace7), hace13Ord = ord(hace13), hace29Ord = ord(hace29);
  const iMesOrd = ord(iMes), iMesAntOrd = ord(iMesAnt), fMesAntOrd = ord(fMesAnt);
  const fechasVivas = [ayerOrd, hoyOrd];
  // Si hoy es día 1, "ayer" pertenece al mes anterior: no debe sumar a "Este mes"
  const ayerEnMes = ayerOrd >= iMesOrd;

  const formatoEspanol = (f: Date): string =>
    `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;

  // ── Lecturas: todas independientes → en PARALELO (1 round-trip de latencia,
  //    no ~10 secuenciales). Todas son baratas (tablas rollup pequeñas + ventana
  //    viva de 2 días + registros recientes por PK). ──
  // Filtro "no propio" unificado: es_propio=0 Y (ip != IP del propietario)
  const propioSql = ' AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != ?)';
  let muSql = `SELECT MIN(timestamp) pu, MAX(timestamp) uu FROM uso_aplicaciones WHERE 1=1`;
  const muArgs: string[] = [];
  if (ipExcluida) { muSql += propioSql; muArgs.push(ipExcluida); }

  let regSql = 'SELECT * FROM uso_aplicaciones WHERE 1=1';
  const regArgs: (string | number)[] = [];
  if (ipExcluida) { regSql += propioSql; regArgs.push(ipExcluida); }
  regSql += ' ORDER BY id DESC LIMIT ?'; regArgs.push(limite);

  const [vivoRes, gcRes, appsAcumRes, muRes, rankRes, rank30Res, ctrlRes, paisRes, ciudadRes, compRes, appsSemCerrRes, appsMesCerrRes, registrosResult] = await Promise.all([
    client.execute({ sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ?`, args: [ayerOrd] }),
    client.execute(
      `SELECT COALESCE(SUM(usos),0) usos, COALESCE(SUM(movil),0) movil, COALESCE(SUM(escritorio),0) escritorio,
              COALESCE(SUM(recurrentes),0) recurrentes, COALESCE(SUM(nuevos),0) nuevos,
              COALESCE(SUM(suma_dur),0) suma_dur, COALESCE(SUM(count_dur),0) count_dur,
              COALESCE(SUM(por_compartir),0) por_compartir
       FROM rollup_dia WHERE 1=1${miipWhere}`
    ),
    client.execute(`SELECT aplicacion FROM rollup_app_acum WHERE 1=1${miipWhere} GROUP BY aplicacion`),
    client.execute({ sql: muSql, args: muArgs }),
    client.execute(
      `SELECT aplicacion, SUM(usos) usos, SUM(suma_dur_cap) sdc, SUM(count_dur_cap) cdc, MAX(ultimo_ord) ult
       FROM rollup_app_acum WHERE 1=1${miipWhere} GROUP BY aplicacion`
    ),
    // Usos por app en los últimos 30 días (días cerrados; la ventana viva se suma después)
    client.execute({ sql: `SELECT aplicacion, SUM(usos) usos FROM rollup_dia_app WHERE fecha_ord >= ?${miipWhere} GROUP BY aplicacion`, args: [hace29Ord] }),
    // Último día agregado (estado del rollup para la status bar del dashboard)
    client.execute(`SELECT MAX(fecha_ord) m FROM rollup_control`),
    client.execute(`SELECT pais, SUM(usos) usos FROM rollup_pais_acum WHERE 1=1${miipWhere} GROUP BY pais`),
    client.execute(`SELECT ciudad, SUM(usos) usos FROM rollup_ciudad_acum WHERE 1=1${miipWhere} GROUP BY ciudad`),
    client.execute({
      sql: `SELECT
          COALESCE(SUM(CASE WHEN fecha_ord = ? THEN usos END),0) anteayer,
          COALESCE(SUM(CASE WHEN fecha_ord BETWEEN ? AND ? THEN usos END),0) sem_cerr,
          COALESCE(SUM(CASE WHEN fecha_ord BETWEEN ? AND ? THEN usos END),0) sem_ant,
          COALESCE(SUM(CASE WHEN fecha_ord BETWEEN ? AND ? THEN usos END),0) mes_cerr,
          COALESCE(SUM(CASE WHEN fecha_ord BETWEEN ? AND ? THEN usos END),0) mes_ant
        FROM rollup_dia WHERE 1=1${miipWhere}`,
      args: [anteayerOrd, hace6Ord, anteayerOrd, hace13Ord, hace7Ord, iMesOrd, anteayerOrd, iMesAntOrd, fMesAntOrd],
    }),
    client.execute({ sql: `SELECT DISTINCT aplicacion FROM rollup_dia_app WHERE fecha_ord BETWEEN ? AND ?${miipWhere}`, args: [hace6Ord, anteayerOrd] }),
    client.execute({ sql: `SELECT DISTINCT aplicacion FROM rollup_dia_app WHERE fecha_ord BETWEEN ? AND ?${miipWhere}`, args: [iMesOrd, anteayerOrd] }),
    client.execute({ sql: regSql, args: regArgs }),
  ]);

  const vivo = agregarRegistros(vivoRes.rows, ipConfigurada);

  const sumarGlobalVivo = (fechas: string[]): GlobalAcc => {
    const acc = nuevoGlobal();
    for (const f of fechas) {
      const pair = vivo.gMap.get(f); if (!pair) continue;
      for (const m of miipList) {
        const g = pair[m];
        acc.usos += g.usos; acc.movil += g.movil; acc.escritorio += g.escritorio;
        acc.recurrentes += g.recurrentes; acc.nuevos += g.nuevos;
        acc.suma_dur += g.suma_dur; acc.count_dur += g.count_dur;
        acc.por_compartir += g.por_compartir;
      }
    }
    return acc;
  };
  const vivoUsos = (fechas: string[]): number => {
    let s = 0;
    for (const f of fechas) { const p = vivo.gMap.get(f); if (!p) continue; for (const m of miipList) s += p[m].usos; }
    return s;
  };
  const appsVivo = (fechas: string[]): Set<string> => {
    const s = new Set<string>();
    for (const f of fechas) { const p = vivo.appMap.get(f); if (!p) continue; for (const m of miipList) for (const a of p[m].keys()) s.add(a); }
    return s;
  };

  // ── Globales all-time: cerrado (rollup_dia) + vivo ──
  const gc = gcRes.rows[0];
  const gv = sumarGlobalVivo(fechasVivas);
  const total = Number(gc.usos) + gv.usos;
  const totalMovil = Number(gc.movil) + gv.movil;
  const totalEscritorio = Number(gc.escritorio) + gv.escritorio;
  const totalRecurrentes = Number(gc.recurrentes) + gv.recurrentes;
  const totalNuevos = Number(gc.nuevos) + gv.nuevos;
  const sumaDur = Number(gc.suma_dur) + gv.suma_dur;
  const countDur = Number(gc.count_dur) + gv.count_dur;
  const duracionPromedio = countDur > 0 ? sumaDur / countDur : 0;
  const totalPorCompartir = Number(gc.por_compartir) + gv.por_compartir;

  const porcentajeMovil = total > 0 ? Math.round((totalMovil / total) * 1000) / 10 : 0;
  const porcentajeEscritorio = total > 0 ? Math.round((totalEscritorio / total) * 1000) / 10 : 0;
  const porcentajeRecurrentes = total > 0 ? Math.round((totalRecurrentes / total) * 1000) / 10 : 0;

  // total_aplicaciones (distinct all-time): apps acumuladas + vivas
  const appsSet = new Set<string>();
  for (const r of appsAcumRes.rows) appsSet.add(String(r.aplicacion));
  for (const a of appsVivo(fechasVivas)) appsSet.add(a);
  const totalAplicaciones = appsSet.size;

  // primer/ultimo uso: MIN/MAX textual (con índice → barato), igual que el original
  const primer_uso = muRes.rows[0]?.pu ?? null;
  const ultimo_uso = muRes.rows[0]?.uu ?? null;

  // ── Ranking de apps: acumulado + vivo ──
  type RankAcc = { usos: number; sdc: number; cdc: number; ult: string };
  const rankMap = new Map<string, RankAcc>();
  for (const r of rankRes.rows) {
    rankMap.set(String(r.aplicacion), {
      usos: Number(r.usos), sdc: Number(r.sdc), cdc: Number(r.cdc), ult: String(r.ult || ''),
    });
  }
  for (const f of fechasVivas) {
    const pair = vivo.appMap.get(f); if (!pair) continue;
    for (const m of miipList) for (const [app, a] of pair[m]) {
      let acc = rankMap.get(app);
      if (!acc) { acc = { usos: 0, sdc: 0, cdc: 0, ult: '' }; rankMap.set(app, acc); }
      acc.usos += a.usos; acc.sdc += a.suma_dur_cap; acc.cdc += a.count_dur_cap;
      if (f > acc.ult) acc.ult = f;
    }
  }

  // Usos por app en los últimos 30 días: cerrado (rank30Res) + ventana viva.
  // Base del "estado" del ranking: refleja actividad ACTUAL, no histórica
  // (con all-time, una app muerta con usos antiguos aparecía como Activa).
  const usos30Map = new Map<string, number>();
  for (const r of rank30Res.rows) usos30Map.set(String(r.aplicacion), Number(r.usos));
  for (const f of fechasVivas) {
    const pair = vivo.appMap.get(f); if (!pair) continue;
    for (const m of miipList) for (const [app, a] of pair[m]) {
      usos30Map.set(app, (usos30Map.get(app) || 0) + a.usos);
    }
  }

  const rankingAplicaciones = [...rankMap.entries()]
    .map(([aplicacion, a]) => {
      const usos = a.usos;
      const usos30 = usos30Map.get(aplicacion) || 0;
      let estado = '💤 Sin uso 30d';
      if (usos30 >= 10) estado = '✅ Activa';
      else if (usos30 >= 1) estado = '⚠️ Bajo uso';
      const raw = a.ult;
      const ultimoUso = raw.length === 8 ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}` : raw;
      const durProm = a.cdc > 0 ? a.sdc / a.cdc : 0;
      return {
        aplicacion, total_usos: usos, usos_30d: usos30, ultimo_uso: ultimoUso,
        duracion_promedio_segundos: durProm,
        duracion_promedio_formato: formatearDuracion(Math.round(durProm)),
        estado,
      };
    })
    .sort((x, y) => y.total_usos - x.total_usos);

  // ── Geografía: países (top 20) y ciudades (top 10) ──
  const paisAcc = new Map<string, number>();
  for (const r of paisRes.rows) paisAcc.set(String(r.pais), Number(r.usos));
  for (const f of fechasVivas) { const p = vivo.paisMap.get(f); if (!p) continue; for (const m of miipList) for (const [k, u] of p[m]) paisAcc.set(k, (paisAcc.get(k) || 0) + u); }
  const paises = [...paisAcc.entries()].map(([pais, total]) => ({ pais, total })).sort((a, b) => b.total - a.total).slice(0, 20);

  const ciudadAcc = new Map<string, number>();
  for (const r of ciudadRes.rows) ciudadAcc.set(String(r.ciudad), Number(r.usos));
  for (const f of fechasVivas) { const p = vivo.ciudadMap.get(f); if (!p) continue; for (const m of miipList) for (const [k, u] of p[m]) ciudadAcc.set(k, (ciudadAcc.get(k) || 0) + u); }
  const ciudades = [...ciudadAcc.entries()].map(([ciudad, total]) => ({ ciudad, total })).sort((a, b) => b.total - a.total).slice(0, 10);

  // ── Comparativa temporal ── (porciones cerradas ya leídas en paralelo)
  const cc = compRes.rows[0];

  const usosHoy = vivoUsos([hoyOrd]);
  const usosAyer = vivoUsos([ayerOrd]);
  const usosAnteayer = Number(cc.anteayer);
  const usosSemana = Number(cc.sem_cerr) + usosHoy + usosAyer;
  const usosSemanaAnt = Number(cc.sem_ant);
  // Si hoy es día 1, "ayer" (día vivo) pertenece al mes anterior: suma allí, no aquí
  const usosMes = Number(cc.mes_cerr) + usosHoy + (ayerEnMes ? usosAyer : 0);
  const usosMesAnt = Number(cc.mes_ant) + (ayerEnMes ? 0 : usosAyer);

  // apps_distintas por período (cerrado por rango ya leído en paralelo + vivo)
  const appsHoy = appsVivo([hoyOrd]).size;
  const appsAyer = appsVivo([ayerOrd]).size;
  const setSem = appsVivo([ayerOrd, hoyOrd]); for (const r of appsSemCerrRes.rows) setSem.add(String(r.aplicacion));
  const setMes = appsVivo(ayerEnMes ? [ayerOrd, hoyOrd] : [hoyOrd]); for (const r of appsMesCerrRes.rows) setMes.add(String(r.aplicacion));

  const calcularVariacion = (actual: number, anterior: number) => {
    if (anterior === 0) return { porcentaje: actual > 0 ? 100 : 0, tendencia: actual > 0 ? ('up' as const) : ('neutral' as const) };
    const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
    const tendencia = porcentaje > 0 ? ('up' as const) : porcentaje < 0 ? ('down' as const) : ('neutral' as const);
    return { porcentaje: Math.abs(porcentaje), tendencia };
  };

  const comparativa = {
    hoy: { usos: usosHoy, apps_distintas: appsHoy, comparacion: calcularVariacion(usosHoy, usosAyer), etiqueta: 'vs ayer' },
    ayer: { usos: usosAyer, apps_distintas: appsAyer, comparacion: calcularVariacion(usosAyer, usosAnteayer), etiqueta: 'vs anteayer', fecha: formatoEspanol(ayer) },
    semana: { usos: usosSemana, apps_distintas: setSem.size, comparacion: calcularVariacion(usosSemana, usosSemanaAnt), etiqueta: 'vs semana anterior' },
    mes: { usos: usosMes, apps_distintas: setMes.size, comparacion: calcularVariacion(usosMes, usosMesAnt), etiqueta: 'vs mes anterior' },
    detalles: { ayer: usosAyer, anteayer: usosAnteayer, semanaAnterior: usosSemanaAnt, mesAnterior: usosMesAnt },
  };

  // ── Registros recientes (ya leídos en paralelo, usan PK — baratos) ──
  const registros = registrosResult.rows.map(mapearRegistro);

  // Estado del rollup para la status bar: último día agregado vs esperado (anteayer)
  const rollupHasta = ctrlRes.rows[0]?.m ? String(ctrlRes.rows[0].m) : null;

  return {
    status: 'success',
    version: 'v4-rollup',
    rollup: { hasta: rollupHasta, esperado: anteayerOrd },
    filtros: { limite, excluir_mi_ip, ip_excluida: ipExcluida || null },
    estadisticas: {
      total_usos: total,
      total_aplicaciones: totalAplicaciones,
      primer_uso,
      ultimo_uso,
      duracion_promedio_segundos: Math.round(duracionPromedio * 10) / 10,
      duracion_promedio_formato: formatearDuracion(Math.round(duracionPromedio)),
      dispositivos: {
        movil: { total: totalMovil, porcentaje: porcentajeMovil },
        escritorio: { total: totalEscritorio, porcentaje: porcentajeEscritorio },
      },
      usuarios: {
        nuevos: { total: totalNuevos, porcentaje: Math.round((100 - porcentajeRecurrentes) * 10) / 10 },
        recurrentes: { total: totalRecurrentes, porcentaje: porcentajeRecurrentes },
      },
      por_compartir: totalPorCompartir,
      geografia: { paises, ciudades },
    },
    comparativa,
    registros_mostrados: registros.length,
    ranking_aplicaciones: rankingAplicaciones,
    data: registros,
  };
}

export const analyticsRouter = router({
  /**
   * Procedure: getStats
   * Estadísticas globales del dashboard, siempre vía rollup (días cerrados
   * pre-agregados + ventana viva [ayer, hoy]).
   * El antiguo camino 'en vivo' con filtros de aplicación/fecha se eliminó el
   * 2026-07-14: el dashboard nunca enviaba esos filtros y la lógica duplicada
   * había empezado a divergir del rollup (normalización de países, ventanas).
   */
  getStats: protectedProcedure
    .input(
      z.object({
        limite: z.number().int().positive().default(100),
        excluir_mi_ip: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();
      const ipConfigurada = await leerIpExcluida(client);
      return await getStatsPorRollup(client, input, ipConfigurada);
    }),

  /**
   * Procedure: getAppStats
   * Estadísticas completas de una app específica (sin límite de 500 registros)
   * Reemplaza el filtrado client-side de datos.data en la pestaña Por Aplicación
   */
  getAppStats: protectedProcedure
    .input(z.object({
      aplicacion: z.string(),
      excluir_mi_ip: z.boolean().default(false),
    }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();
      const { aplicacion, excluir_mi_ip } = input;

      let ipExcluida = '';
      if (excluir_mi_ip) {
        try {
          const configResult = await client.execute({
            sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
            args: [],
          });
          if (configResult.rows.length > 0) ipExcluida = String(configResult.rows[0].valor);
        } catch { /* ignorar */ }
      }

      const ipWhere = ipExcluida ? ' AND (ip_address IS NULL OR ip_address != ?)' : '';
      const ipArgs: string[] = ipExcluida ? [ipExcluida] : [];

      // Fecha de hoy (Madrid) en formato DD/MM/YYYY para filtrar con LIKE
      const hoyApp = hoyMadrid();
      const fechaHoy = `${String(hoyApp.getDate()).padStart(2, '0')}/${String(hoyApp.getMonth() + 1).padStart(2, '0')}/${hoyApp.getFullYear()}`;

      const [todayResult, deviceResult, registrosResult] = await Promise.all([
        // Usos de hoy (sin límite, exacto)
        client.execute({
          sql: `SELECT COUNT(*) as total FROM uso_aplicaciones WHERE aplicacion = ? AND timestamp LIKE ?${ipWhere}`,
          args: [aplicacion, `${fechaHoy}%`, ...ipArgs],
        }),
        // Split dispositivos (todos los registros, sin límite)
        client.execute({
          sql: `SELECT tipo_dispositivo, COUNT(*) as total FROM uso_aplicaciones WHERE aplicacion = ?${ipWhere} GROUP BY tipo_dispositivo`,
          args: [aplicacion, ...ipArgs],
        }),
        // Últimos 100 registros para la tabla
        client.execute({
          sql: `SELECT id, timestamp, duracion_segundos, tipo_dispositivo, pais, ciudad FROM uso_aplicaciones WHERE aplicacion = ?${ipWhere} ORDER BY id DESC LIMIT 100`,
          args: [aplicacion, ...ipArgs],
        }),
      ]);

      const movil = Number(deviceResult.rows.find(r => r.tipo_dispositivo === 'movil')?.total) || 0;
      const escritorio = Number(deviceResult.rows.find(r => r.tipo_dispositivo === 'escritorio')?.total) || 0;

      // Registros tipados (evita exponer filas crudas de libsql al frontend)
      const registros = registrosResult.rows.map((row) => ({
        id: Number(row.id),
        timestamp: String(row.timestamp ?? ''),
        duracion_segundos: row.duracion_segundos == null ? null : Number(row.duracion_segundos),
        tipo_dispositivo: row.tipo_dispositivo == null ? null : String(row.tipo_dispositivo),
        pais: row.pais == null ? null : String(row.pais),
        ciudad: row.ciudad == null ? null : String(row.ciudad),
      }));

      return {
        usos_hoy: Number(todayResult.rows[0]?.total) || 0,
        dispositivos: { movil, escritorio },
        registros,
      };
    }),

  /**
   * Procedure: getResumen
   * Devuelve tabla de usos desglosada por origen (Web, IA por plataforma, MCP, Bots, Mi IP)
   * y período (Hoy, Ayer, 7 días, Este mes, Total)
   */
  getResumen: protectedProcedure
    .input(z.object({}))
    .query(async () => {
      await initializeDatabase();
      const client = getTursoClient();

      // Leer IP excluida siempre (para separar "Mi IP" como fila propia)
      let ipExcluida = '';
      try {
        const configResult = await client.execute({
          sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
          args: [],
        });
        if (configResult.rows.length > 0) {
          ipExcluida = String(configResult.rows[0].valor);
        }
      } catch {
        // Ignorar si la tabla no existe
      }

      // Rangos de fechas en hora Madrid. "7 días" = [hoy-6, hoy] (7 días naturales,
      // misma definición que la comparativa de getStats — sin solape con la anterior)
      const hoy = hoyMadrid();
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const hace6Dias = new Date(hoy); hace6Dias.setDate(hoy.getDate() - 6);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ord = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const hoyOrd = ord(hoy), ayerOrd = ord(ayer), hace6Ord = ord(hace6Dias), iMesOrd = ord(inicioMes);

      type Conteo = { hoy: number; ayer: number; semana: number; mes: number; total: number };
      const conteos: Record<string, Conteo> = {};
      const nuevaFila = (): Conteo => ({ hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 });

      // Categorías del modelo unificado (claves que produce el rollup)
      ['web', 'chatgpt', 'copilot', 'otras-ia', 'mcp', 'pwa', 'redes', 'bot', 'propio'].forEach(
        (k) => { conteos[k] = nuevaFila(); }
      );

      // Vía rollup: días cerrados agregados por origen (rollup_dia_origen ya incluye
      // 'mi-ip'/'bot'/etc.) + ventana viva [ayer, hoy] con la MISMA clasificación.
      const [cerrRes, vivoRes] = await Promise.all([
        client.execute({
          sql: `SELECT origen, SUM(usos) total,
                  SUM(CASE WHEN fecha_ord >= ? THEN usos ELSE 0 END) mes,
                  SUM(CASE WHEN fecha_ord >= ? THEN usos ELSE 0 END) sem
                FROM rollup_dia_origen GROUP BY origen`,
          args: [iMesOrd, hace6Ord],
        }),
        client.execute({ sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ?`, args: [ayerOrd] }),
      ]);
      const vivo = agregarRegistros(vivoRes.rows, ipExcluida);

      // Cargar porciones cerradas (total/mes/semana; hoy y ayer van por la ventana viva)
      for (const r of cerrRes.rows) {
        const origen = String(r.origen);
        if (!conteos[origen]) conteos[origen] = nuevaFila();
        const c = conteos[origen];
        c.total += Number(r.total);
        c.mes += Number(r.mes);
        c.semana += Number(r.sem);
      }

      // Cargar ventana viva (ayer y hoy)
      const oHoy = vivo.origenMap.get(hoyOrd) || new Map<string, number>();
      const oAyer = vivo.origenMap.get(ayerOrd) || new Map<string, number>();
      const ayerEnMes = ayerOrd >= iMesOrd; // si hoy es día 1 del mes, ayer no cuenta en "mes"
      for (const origen of new Set([...oHoy.keys(), ...oAyer.keys()])) {
        if (!conteos[origen]) conteos[origen] = nuevaFila();
        const c = conteos[origen];
        const vHoy = oHoy.get(origen) || 0;
        const vAyer = oAyer.get(origen) || 0;
        c.hoy += vHoy;
        c.ayer += vAyer;
        c.semana += vHoy + vAyer;               // ayer y hoy siempre caen en [hoy-6, hoy]
        c.mes += vHoy + (ayerEnMes ? vAyer : 0);
        c.total += vHoy + vAyer;
      }

      // Filas en orden fijo (modelo unificado). Grupos compatibles con el frontend:
      // 'ia' (fondo teal), 'bot'/'miip' (gris). 'web'/'mcp'/'pwa'/'redes' sin estilo.
      const filasOrden: Array<{ key: string; label: string; icono: string; grupo: string }> = [
        { key: 'web',      label: 'Web',                 icono: '🌐', grupo: 'web' },
        { key: 'chatgpt',  label: 'IA · ChatGPT',        icono: '🤖', grupo: 'ia' },
        { key: 'copilot',  label: 'IA · Copilot',        icono: '🤖', grupo: 'ia' },
        { key: 'otras-ia', label: 'IA · Otras',          icono: '🤖', grupo: 'ia' },
        { key: 'mcp',      label: 'IA / MCP',            icono: '🔗', grupo: 'mcp' },
        { key: 'pwa',      label: 'App instalada (PWA)', icono: '📱', grupo: 'pwa' },
        { key: 'redes',    label: 'Redes sociales',      icono: '📣', grupo: 'redes' },
        { key: 'bot',      label: 'Bots',                icono: '🕷️', grupo: 'bot' },
        { key: 'propio',   label: 'Propio',              icono: '🏠', grupo: 'miip' },
      ];

      const filas = filasOrden.map(({ key, label, icono, grupo }) => ({
        origen: label,
        icono,
        grupo,
        ...(conteos[key] || nuevaFila()),
      }));

      // Total Real = todo excepto Bots y Propio (web + IA + MCP + PWA + Redes)
      const excluirDeTotalReal = new Set(['bot', 'propio']);
      const totalReal = nuevaFila();
      for (const [key, vals] of Object.entries(conteos)) {
        if (!excluirDeTotalReal.has(key)) {
          totalReal.hoy    += vals.hoy;
          totalReal.ayer   += vals.ayer;
          totalReal.semana += vals.semana;
          totalReal.mes    += vals.mes;
          totalReal.total  += vals.total;
        }
      }

      return { filas, totalReal };
    }),

  /**
   * Procedure: getTendencia30Dias
   * Calcula usos agrupados por día para los últimos 30 días directamente en DB.
   * Devuelve un array completo de 30 entradas (días sin datos tienen usos=0).
   */
  getTendencia30Dias: protectedProcedure
    .input(z.object({ excluir_mi_ip: z.boolean().default(false) }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      // Leer siempre (on-demand necesita la IP; el filtro la usa solo si excluir_mi_ip=true)
      const ipConfigurada = await leerIpExcluida(client);
      const ipExcluida = input.excluir_mi_ip ? ipConfigurada : '';

      // On-demand defensivo: rellena el día que acaba de salir de la ventana viva
      // (mismo patrón que getStatsPorRollup, getTendencias y getDistribucionDuraciones)
      try { await computarRollupPendientes(client, ipConfigurada, 7); } catch { /* no bloquear */ }

      // Fecha de hace 29 días (para incluir hoy = 30 días en total), en formato YYYYMMDD
      const hoy = hoyMadrid();
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 29);
      const inicioStr = `${inicio.getFullYear()}${String(inicio.getMonth() + 1).padStart(2, '0')}${String(inicio.getDate()).padStart(2, '0')}`;

      // Vía rollup: días cerrados (rollup_dia, ya por día) + ventana viva [ayer, hoy]
      const miipWhere = (input.excluir_mi_ip && ipExcluida) ? ' AND es_miip = 0' : '';
      const miipList: (0 | 1)[] = (input.excluir_mi_ip && ipExcluida) ? [0] : [0, 1];
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const ayerOrd = `${ayer.getFullYear()}${String(ayer.getMonth() + 1).padStart(2, '0')}${String(ayer.getDate()).padStart(2, '0')}`;

      const [cerrRes, vivoRes] = await Promise.all([
        client.execute({ sql: `SELECT fecha_ord, SUM(usos) usos FROM rollup_dia WHERE fecha_ord >= ?${miipWhere} GROUP BY fecha_ord`, args: [inicioStr] }),
        client.execute({ sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ?`, args: [ayerOrd] }),
      ]);
      const vivo = agregarRegistros(vivoRes.rows, ipExcluida);

      // Mapa YYYYMMDD → usos: cerrados + ventana viva (sin solape: rollup ≤ anteayer, vivo ≥ ayer)
      const mapaUsos: Record<string, number> = {};
      for (const row of cerrRes.rows) {
        mapaUsos[String(row.fecha_ord)] = Number(row.usos);
      }
      for (const [f, pair] of vivo.gMap) {
        let u = 0; for (const m of miipList) u += pair[m].usos;
        mapaUsos[f] = (mapaUsos[f] || 0) + u;
      }

      // Construir array completo de 30 días con ceros para días sin registros
      const dias: Array<{ fecha: string; usos: number }> = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() - i);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const ord = `${yyyy}${mm}${dd}`;
        dias.push({ fecha: `${dd}/${mm}`, usos: mapaUsos[ord] || 0 });
      }

      return { dias };
    }),

  /**
   * Procedure: getIPConfig
   * Obtiene configuración de IP excluida
   * Reemplaza: GET /api/analytics/ip-filter
   */
  getIPConfig: protectedProcedure
    .input(z.object({ ip_actual: z.string() }))
    .query(async ({ ctx, input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      // Leer IP real desde headers del request (x-forwarded-for vía Vercel)
      // Fallback a input.ip_actual solo si no hay headers (no debería ocurrir en producción)
      const ipActual = getClientIPFromRequest(ctx.req) !== 'unknown'
        ? getClientIPFromRequest(ctx.req)
        : anonymizeIP(input.ip_actual);

      // Buscar IP excluida en la tabla de configuración
      const result = await client.execute({
        sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
        args: [],
      });

      const ipExcluida = result.rows.length > 0 ? String(result.rows[0].valor) : '';

      // Obtener estado del filtro
      const estadoResult = await client.execute({
        sql: `SELECT valor FROM analytics_config WHERE clave = 'filtro_ip_activo'`,
        args: [],
      });

      const filtroActivo = estadoResult.rows.length > 0 ? estadoResult.rows[0].valor === 'true' : true;

      return {
        status: 'success',
        data: {
          ip_actual: ipActual,
          ip_excluida: ipExcluida,
          activo: filtroActivo,
        },
      };
    }),

  /**
   * Procedure: updateIPFilter
   * Guarda la IP actual como excluida
   * Reemplaza: POST /api/analytics/ip-filter
   */
  updateIPFilter: protectedProcedure
    .input(
      z.object({
        ip_actual: z.string(),
        activo: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      // Leer IP real desde headers del request (x-forwarded-for vía Vercel)
      // Fallback a input.ip_actual solo si no hay headers (no debería ocurrir en producción)
      const ipActual = getClientIPFromRequest(ctx.req) !== 'unknown'
        ? getClientIPFromRequest(ctx.req)
        : anonymizeIP(input.ip_actual);

      // Marcar retroactivamente los registros históricos de la IP anterior como
      // es_propio = 1 ANTES de sustituirla. El filtro de tráfico propio compara
      // `ip_address != ip_excluida`, así que al cambiar de IP dinámica todo el
      // histórico propio de la IP vieja volvería a contarse como tráfico real.
      // (Este paso existía en la API route legacy y se perdió al migrar a tRPC.)
      const ipAnteriorResult = await client.execute({
        sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
        args: [],
      });
      if (ipAnteriorResult.rows.length > 0) {
        const ipAnterior = String(ipAnteriorResult.rows[0].valor);
        if (ipAnterior && ipAnterior !== ipActual) {
          await client.execute({
            sql: `UPDATE uso_aplicaciones SET es_propio = 1
                  WHERE ip_address = ? AND (es_propio IS NULL OR es_propio = 0)`,
            args: [ipAnterior],
          });
        }
      }

      // Guardar o actualizar IP excluida
      await client.execute({
        sql: `INSERT OR REPLACE INTO analytics_config (clave, valor, actualizado)
              VALUES ('ip_excluida', ?, datetime('now'))`,
        args: [ipActual],
      });

      // Guardar estado del filtro
      await client.execute({
        sql: `INSERT OR REPLACE INTO analytics_config (clave, valor, actualizado)
              VALUES ('filtro_ip_activo', ?, datetime('now'))`,
        args: [input.activo ? 'true' : 'false'],
      });

      return {
        status: 'success',
        data: {
          ip_excluida: ipActual,
          activo: input.activo,
        },
        message: `IP ${ipActual} guardada correctamente`,
      };
    }),

  /**
   * Procedure: getNavegacion
   * Análisis de patrones de navegación entre apps usando sesion_id.
   *
   * Devuelve:
   *  - KPIs globales: total sesiones, apps por sesión (medio), %single-app, %multi-app
   *  - Distribución de longitud de sesión (1, 2, 3, 4-5, 6+ apps)
   *  - Origen de la primera app de la sesión (home / directo / referencia)
   *  - Top pares from→to (transiciones internas)
   *  - Apps "puente" vs "puerta" (continúan vs terminan sesión)
   *
   * Excluye bots, mcp y mi-ip por defecto.
   */
  getNavegacion: protectedProcedure
    .input(
      z.object({
        dias: z.number().int().positive().default(14), // ventana de análisis
      })
    )
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      // Leer IP excluida
      let ipExcluida = '';
      try {
        const cfg = await client.execute({
          sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
          args: [],
        });
        if (cfg.rows.length > 0) ipExcluida = String(cfg.rows[0].valor);
      } catch { /* tabla aún no existe */ }

      // Calcular fecha límite (hace N días) en hora Madrid (los timestamps son Madrid)
      const ahora = ahoraMadrid();
      const limite = new Date(ahora);
      limite.setDate(limite.getDate() - input.dias);
      // Sub-ventanas anidadas para el pulso del descubrimiento interno: 24 h y 7 días
      const limite7 = new Date(ahora); limite7.setDate(limite7.getDate() - 7);
      const limite1 = new Date(ahora); limite1.setDate(limite1.getDate() - 1);
      // Contadores de clics ?from= y visitas por sub-ventana (24 h / 7 d); la quincena reutiliza los KPIs de 14 d
      let visitas24h = 0, visitas7d = 0, clics24h = 0, clics7d = 0;

      // Cargar visitas relevantes ordenadas por sesión y momento.
      // Excluimos bot, mcp y mi-ip ya en SQL, y ACOTAMOS por fecha en SQL
      // (FECHA_EXPR ≥ día del límite): antes se escaneaba y transfería la tabla
      // entera y se descartaba por fecha en JS — se degradaba con el histórico.
      // El corte fino por hora exacta se mantiene en JS (limite incluye la hora).
      const limiteOrd = `${limite.getFullYear()}${String(limite.getMonth() + 1).padStart(2, '0')}${String(limite.getDate()).padStart(2, '0')}`;
      const result = await client.execute({
        sql: `SELECT id, aplicacion, sesion_id, modo, datos_adicionales, ip_address, timestamp
              FROM uso_aplicaciones
              WHERE sesion_id IS NOT NULL AND sesion_id != ''
                AND modo NOT IN ('bot', 'mcp')
                AND ${FECHA_EXPR} >= ?
                ${ipExcluida ? 'AND (ip_address != ? OR ip_address IS NULL)' : ''}
              ORDER BY sesion_id ASC, id ASC`,
        args: ipExcluida ? [limiteOrd, ipExcluida] : [limiteOrd],
      });

      // Parsear timestamp español "DD/MM/YYYY, HH:MM:SS" → Date
      const parsearFecha = (ts: string): Date | null => {
        const m = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})/);
        if (!m) return null;
        return new Date(
          parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]),
          parseInt(m[4]), parseInt(m[5]), parseInt(m[6])
        );
      };

      // Estructura: agrupar por sesion_id manteniendo orden
      type Visita = { app: string; from: string | null; modo: string };
      const sesiones = new Map<string, Visita[]>();

      for (const row of result.rows) {
        const ts = String(row.timestamp || '');
        const fecha = parsearFecha(ts);
        if (!fecha || fecha < limite) continue;

        const sesionId = String(row.sesion_id);
        const app = String(row.aplicacion || '');
        const modo = String(row.modo || 'web');

        let from: string | null = null;
        try {
          if (row.datos_adicionales) {
            const datos = JSON.parse(String(row.datos_adicionales));
            if (datos && typeof datos.from === 'string') from = datos.from;
          }
        } catch { /* ignorar */ }

        // Pulso por sub-ventana (ventanas anidadas: 24 h ⊂ 7 d ⊂ 14 d)
        if (fecha >= limite1) { visitas24h++; if (from) clics24h++; }
        if (fecha >= limite7) { visitas7d++; if (from) clics7d++; }

        if (!sesiones.has(sesionId)) sesiones.set(sesionId, []);
        sesiones.get(sesionId)!.push({ app, from, modo });
      }

      // KPIs globales
      const totalSesiones = sesiones.size;
      let totalVisitas = 0;
      let sesionesConHome = 0;
      let sesionesSingleApp = 0;
      let sesionesMultiApp = 0;
      const distribLongitud: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4-5': 0, '6+': 0 };

      // Origen de primera app por sesión
      const origenPrimeraApp: Record<string, number> = {
        'home': 0,
        'directo-google-ia': 0,
      };

      // Pares from→to: clave "from|to"
      const paresFromTo: Map<string, number> = new Map();

      // Para apps puente/puerta:
      // - apariciones[app] = veces que aparece como visita en una sesión
      // - continuaciones[app] = veces que después de visitar app hay otra app distinta en la sesión
      const apariciones: Map<string, number> = new Map();
      const continuaciones: Map<string, number> = new Map();
      const incInc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) || 0) + 1);

      // Descubrimiento interno (KPI honesto): cuenta cada clic de navegación entre apps
      // a través del atributo ?from=, INDEPENDIENTEMENTE de si la sesión se fragmenta.
      // apps/sesión infravalora este dato porque el sesion_id no sobrevive a los saltos
      // en webviews in-app (app de Google, ChatGPT, redes) ni a las aperturas en pestaña nueva.
      let clicsInternos = 0;
      const clicsPorCategoria: Record<string, number> = {};
      // Portales verticales que emiten `?from=<portal>` al enlazar de vuelta a meskeIA.
      const PORTALES_VERTICALES = ['delegum', 'cronicum', 'stemum', 'coquinum'];
      const categoriaDe = (from: string): string => {
        if (from.startsWith('related-')) return 'related';
        if (['home-daily', 'sidebar-recent', 'catalog', 'catalog-guides', 'search'].includes(from)) return from;
        // Saltos cross-dominio (antes caían todos en "otro"):
        if (from === 'meskeia') return 'a-vertical';                        // meskeIA → portal vertical
        if (PORTALES_VERTICALES.includes(from)) return 'portal-a-meskeia';  // portal vertical → meskeIA
        return 'otro';
      };

      for (const [, visitas] of sesiones) {
        const appsUnicas = new Set(visitas.map(v => v.app));
        totalVisitas += visitas.length;

        // Longitud
        const n = appsUnicas.size;
        if (n === 1) { sesionesSingleApp++; distribLongitud['1']++; }
        else { sesionesMultiApp++; }
        if (n === 2) distribLongitud['2']++;
        else if (n === 3) distribLongitud['3']++;
        else if (n >= 4 && n <= 5) distribLongitud['4-5']++;
        else if (n >= 6) distribLongitud['6+']++;

        // Pasa por home
        if (appsUnicas.has('home') || appsUnicas.has('/')) sesionesConHome++;

        // Origen primera app
        const primera = visitas[0];
        if (primera.app === 'home' || primera.app === '/') origenPrimeraApp['home']++;
        else origenPrimeraApp['directo-google-ia']++;

        // Pares from→to (usa from si existe, si no encadena con la app anterior)
        for (let i = 0; i < visitas.length; i++) {
          const v = visitas[i];
          // Apariciones contables: cada visita única en la sesión
          incInc(apariciones, v.app);

          // Continuación: si hay siguiente visita y es app distinta, esta es app puente
          const tieneSiguiente = visitas.slice(i + 1).some(s => s.app !== v.app);
          if (tieneSiguiente) incInc(continuaciones, v.app);

          // Clic de descubrimiento interno: cualquier visita con ?from= explícito
          if (v.from) {
            clicsInternos++;
            const cat = categoriaDe(v.from);
            clicsPorCategoria[cat] = (clicsPorCategoria[cat] || 0) + 1;
          }

          // Par from→to: priorizar el `from` explícito (RelatedApps, home-daily, search...)
          let origen: string | null = null;
          if (v.from) {
            origen = v.from;
          } else if (i > 0) {
            origen = `prev:${visitas[i - 1].app}`;
          }
          if (origen) {
            const key = `${origen}|${v.app}`;
            paresFromTo.set(key, (paresFromTo.get(key) || 0) + 1);
          }
        }
      }

      // Top pares from→to (top 30)
      const topPares = Array.from(paresFromTo.entries())
        .map(([k, count]) => {
          const [origen, destino] = k.split('|');
          return { origen, destino, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 30);

      // Apps puente/puerta (top 20 por apariciones, mostrando ratio de continuación)
      const tablaPuente = Array.from(apariciones.entries())
        .map(([app, apar]) => ({
          app,
          apariciones: apar,
          continuaciones: continuaciones.get(app) || 0,
          ratio: apar > 0 ? (continuaciones.get(app) || 0) / apar : 0,
        }))
        .filter(r => r.apariciones >= 3) // mínimo 3 apariciones para ser estadísticamente útil
        .sort((a, b) => b.apariciones - a.apariciones)
        .slice(0, 20);

      const appsPorSesionMedio = totalSesiones > 0 ? totalVisitas / totalSesiones : 0;
      const pctSingleApp = totalSesiones > 0 ? (sesionesSingleApp / totalSesiones) * 100 : 0;
      const pctMultiApp = totalSesiones > 0 ? (sesionesMultiApp / totalSesiones) * 100 : 0;
      const pctConHome = totalSesiones > 0 ? (sesionesConHome / totalSesiones) * 100 : 0;
      const pctOrigenHome = totalSesiones > 0 ? (origenPrimeraApp['home'] / totalSesiones) * 100 : 0;
      const pctOrigenDirecto = totalSesiones > 0 ? (origenPrimeraApp['directo-google-ia'] / totalSesiones) * 100 : 0;

      return {
        ventanaDias: input.dias,
        kpis: {
          totalSesiones,
          totalVisitas,
          appsPorSesionMedio: Math.round(appsPorSesionMedio * 100) / 100,
          pctSingleApp: Math.round(pctSingleApp * 10) / 10,
          pctMultiApp: Math.round(pctMultiApp * 10) / 10,
          pctConHome: Math.round(pctConHome * 10) / 10,
          pctOrigenHome: Math.round(pctOrigenHome * 10) / 10,
          pctOrigenDirecto: Math.round(pctOrigenDirecto * 10) / 10,
        },
        descubrimientoInterno: {
          total: clicsInternos,
          pctDeVisitas: totalVisitas > 0 ? Math.round((clicsInternos / totalVisitas) * 1000) / 10 : 0,
          porCategoria: clicsPorCategoria,
          // Pulso en 3 ventanas anidadas: mide si la TASA de descubrimiento interno acelera o frena
          ventanas: {
            hoy: { clics: clics24h, visitas: visitas24h, pct: visitas24h > 0 ? Math.round((clics24h / visitas24h) * 1000) / 10 : 0 },
            semana: { clics: clics7d, visitas: visitas7d, pct: visitas7d > 0 ? Math.round((clics7d / visitas7d) * 1000) / 10 : 0 },
            quincena: { clics: clicsInternos, visitas: totalVisitas, pct: totalVisitas > 0 ? Math.round((clicsInternos / totalVisitas) * 1000) / 10 : 0 },
          },
        },
        distribucionLongitud: distribLongitud,
        topPares,
        tablaPuente,
      };
    }),

  /**
   * Procedure: getTendencias
   * Devuelve tendencia mensual 2026, desglose por canal y % LATAM mes actual vs anterior.
   * Sin input: SIEMPRE excluye tráfico propio y bots (el toggle de IP del dashboard
   * no le aplica — antes declaraba excluir_mi_ip y lo ignoraba, provocando refetches
   * sin efecto al cambiar el toggle).
   */
  getTendencias: protectedProcedure
    .query(async () => {
      await initializeDatabase();
      const client = getTursoClient();
      const ipConfigurada = await leerIpExcluida(client);
      try { await computarRollupPendientes(client, ipConfigurada, 7); } catch { /* no bloquear */ }

      // Tendencias = imagen visual del tráfico REAL (siempre sin propio ni bots).
      // Universo: web+ia+pwa+redes (excluye mcp, como el cálculo original).
      // Sesiones por mes: APROXIMACIÓN (suma de sesiones-únicas-por-día); el error
      // por sesiones que cruzan medianoche es despreciable para una tendencia visual.
      const hoy = hoyMadrid();
      const anio = String(hoy.getFullYear());
      const mesAct = `${anio}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
      const mAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const mesAnt = `${mAnt.getFullYear()}-${String(mAnt.getMonth() + 1).padStart(2, '0')}`;

      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const ordF = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const ayerOrd = ordF(ayer);
      const fechasVivas = [ayerOrd, ordF(hoy)];
      const ordAMes = (o: string) => `${o.slice(0, 4)}-${o.slice(4, 6)}`;

      const mesExpr = `substr(fecha_ord,1,4)||'-'||substr(fecha_ord,5,2)`;
      const U2_SQL = `('web','chatgpt','copilot','otras-ia','pwa','redes')`;
      const LATAM = new Set(['MX', 'CO', 'AR', 'BO', 'EC', 'PE', 'CL', 'CR', 'VE', 'UY', 'PY', 'GT', 'HN', 'SV', 'NI', 'DO', 'CU', 'PA', 'PR']);
      const canalDe = (o: string): CanalKey => o === 'web' ? 'web' : o === 'redes' ? 'social' : o === 'pwa' ? 'pwa' : 'ia';

      const [origenRes, sesRes, paisRes, vivoRes] = await Promise.all([
        client.execute(`SELECT ${mesExpr} mes, origen, SUM(usos) v FROM rollup_dia_origen WHERE substr(fecha_ord,1,4)='${anio}' AND origen IN ${U2_SQL} GROUP BY mes, origen`),
        client.execute(`SELECT ${mesExpr} mes, SUM(sesiones) s FROM rollup_dia WHERE es_miip=0 AND substr(fecha_ord,1,4)='${anio}' GROUP BY mes`),
        client.execute(`SELECT ${mesExpr} mes, pais, SUM(usos) v FROM rollup_dia_pais WHERE es_miip=0 GROUP BY mes, pais`),
        client.execute({ sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ?`, args: [ayerOrd] }),
      ]);
      const vivo = agregarRegistros(vivoRes.rows, ipConfigurada);

      type CanalKey = 'web' | 'ia' | 'social' | 'pwa';
      type MesAcc = { visitas: number; sesiones: number; paises: Set<string>; canales: Record<CanalKey, number>; latamTotal: number; latamN: number };
      const meses = new Map<string, MesAcc>();
      const getMes = (m: string): MesAcc => {
        let x = meses.get(m);
        if (!x) { x = { visitas: 0, sesiones: 0, paises: new Set(), canales: { web: 0, ia: 0, social: 0, pwa: 0 }, latamTotal: 0, latamN: 0 }; meses.set(m, x); }
        return x;
      };

      // Días cerrados
      for (const r of origenRes.rows) { const m = getMes(String(r.mes)); const v = Number(r.v); m.visitas += v; m.latamTotal += v; m.canales[canalDe(String(r.origen))] += v; }
      for (const r of sesRes.rows) getMes(String(r.mes)).sesiones += Number(r.s);
      for (const r of paisRes.rows) { const m = getMes(String(r.mes)); const pais = String(r.pais); m.paises.add(pais); if (LATAM.has(pais)) m.latamN += Number(r.v); }

      // Ventana viva [ayer, hoy] (es_miip=0 = sin propio)
      for (const f of fechasVivas) {
        const mesF = ordAMes(f);
        const ob = vivo.origenMap.get(f);
        if (ob) for (const [origen, v] of ob) {
          if (!['web', 'chatgpt', 'copilot', 'otras-ia', 'pwa', 'redes'].includes(origen)) continue;
          const m = getMes(mesF); m.visitas += v; m.latamTotal += v; m.canales[canalDe(origen)] += v;
        }
        const g = vivo.gMap.get(f); if (g) getMes(mesF).sesiones += g[0].sesiones;
        const pb = vivo.paisMap.get(f); if (pb) for (const [pais, v] of pb[0]) { const m = getMes(mesF); m.paises.add(pais); if (LATAM.has(pais)) m.latamN += v; }
      }

      const mensual = [...meses.entries()]
        .filter(([m]) => m.startsWith(anio))
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([mes, d]) => ({ mes, visitas: d.visitas, sesiones: d.sesiones, paises: d.paises.size }));

      const cMes = meses.get(mesAct);
      const canales = cMes ? { ...cMes.canales } : { web: 0, ia: 0, social: 0, pwa: 0 };

      const latam = [mesAnt, mesAct].map(mes => {
        const d = meses.get(mes);
        const total = d?.latamTotal || 0, lat = d?.latamN || 0;
        return { mes, total, latam: lat, pct: total > 0 ? Math.round((lat / total) * 1000) / 10 : 0 };
      });

      return { mensual, canales, latam };
    }),

  /**
   * Distribución de duraciones de visita
   * Buckets: sin registro (NULL) / 2-30s / 30s-2min / 2-10min / >10min
   */
  getDistribucionDuraciones: protectedProcedure
    .input(z.object({ excluir_mi_ip: z.boolean().default(false) }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();
      const ipConfigurada = await leerIpExcluida(client);
      const soloResto = !!(input.excluir_mi_ip && ipConfigurada);
      const miipWhere = soloResto ? ' AND es_miip = 0' : '';
      const miipList: (0 | 1)[] = soloResto ? [0] : [0, 1];

      // On-demand defensivo (1 query si está al día)
      try { await computarRollupPendientes(client, ipConfigurada, 7); } catch { /* no bloquear */ }

      const hoy = hoyMadrid();
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const ordF = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const hoyOrd = ordF(hoy), ayerOrd = ordF(ayer);
      const fechasVivas = [ayerOrd, hoyOrd];

      // Buckets (rollup_dia, universo U2) + apps (rollup_app_acum) + ventana viva
      const [bRes, appRes, vivoRes] = await Promise.all([
        client.execute(`SELECT COALESCE(SUM(b_sinreg),0) sr, COALESCE(SUM(b_rebote),0) rb, COALESCE(SUM(b_corta),0) co, COALESCE(SUM(b_media),0) me, COALESCE(SUM(b_larga),0) la FROM rollup_dia WHERE 1=1${miipWhere}`),
        client.execute(`SELECT aplicacion, SUM(usos) usos, SUM(suma_dur_cap) sdc, SUM(count_dur_cap) cdc, MAX(max_dur) mx FROM rollup_app_acum WHERE 1=1${miipWhere} GROUP BY aplicacion`),
        client.execute({ sql: `SELECT ${CAMPOS_ROLLUP} FROM uso_aplicaciones WHERE ${FECHA_EXPR} >= ?`, args: [ayerOrd] }),
      ]);
      const vivo = agregarRegistros(vivoRes.rows, ipConfigurada);

      const b0 = bRes.rows[0];
      let sinRegistro = Number(b0.sr), rebote = Number(b0.rb), corta = Number(b0.co), media = Number(b0.me), larga = Number(b0.la);
      for (const f of fechasVivas) {
        const pair = vivo.gMap.get(f); if (!pair) continue;
        for (const m of miipList) { const g = pair[m]; sinRegistro += g.b_sinreg; rebote += g.b_rebote; corta += g.b_corta; media += g.b_media; larga += g.b_larga; }
      }
      const total = sinRegistro + rebote + corta + media + larga;
      const pct = (n: number) => total > 0 ? Math.round(n / total * 1000) / 10 : 0;

      // topPorDuracion: acumulado + vivo. Duración media con cap 1.800 (ya aplicado en el rollup).
      type DA = { usos: number; sdc: number; cdc: number; mx: number };
      const appMap = new Map<string, DA>();
      for (const r of appRes.rows) appMap.set(String(r.aplicacion), { usos: Number(r.usos), sdc: Number(r.sdc), cdc: Number(r.cdc), mx: Number(r.mx) || 0 });
      for (const f of fechasVivas) {
        const pair = vivo.appMap.get(f); if (!pair) continue;
        for (const m of miipList) for (const [app, a] of pair[m]) {
          let d = appMap.get(app);
          if (!d) { d = { usos: 0, sdc: 0, cdc: 0, mx: 0 }; appMap.set(app, d); }
          d.usos += a.usos; d.sdc += a.suma_dur_cap; d.cdc += a.count_dur_cap; if (a.max_dur > d.mx) d.mx = a.max_dur;
        }
      }

      const topPorDuracion = [...appMap.entries()]
        .filter(([, d]) => d.cdc >= 3)
        .map(([aplicacion, d]) => {
          const duracionMedia = d.cdc > 0 ? Math.round(d.sdc / d.cdc) : 0;
          // Índice de engagement: media(cap30min) × cobertura × log10(1+con_duración)
          const score = Math.min(duracionMedia, 1800) * (d.cdc / d.usos) * Math.log10(1 + d.cdc);
          return { aplicacion, totalUsos: d.usos, conDuracion: d.cdc, duracionMedia, duracionMax: d.mx, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      return {
        total,
        buckets: [
          { label: 'Sin registro', descripcion: 'Visita < 2s o sin evento de salida', valor: sinRegistro, pct: pct(sinRegistro), color: '#9ca3af' },
          { label: '2 – 30s',      descripcion: 'Rebote rápido',                       valor: rebote,      pct: pct(rebote),      color: '#f59e0b' },
          { label: '30s – 2min',   descripcion: 'Exploración',                          valor: corta,       pct: pct(corta),       color: '#3b82f6' },
          { label: '2 – 10min',    descripcion: 'Uso real',                             valor: media,       pct: pct(media),       color: '#10b981' },
          { label: '> 10min',      descripcion: 'Uso intensivo',                        valor: larga,       pct: pct(larga),       color: '#8b5cf6' },
        ],
        topPorDuracion,
      };
    }),

  /**
   * Procedure: getPorDominio
   * Desglose de visitas por dominio de entrada (vertical): meskeia.com,
   * delegum.com y cronicum.com, servidos por host-rewrite sobre el mismo
   * proyecto. Query EN VIVO sobre uso_aplicaciones (no rollup — opción simple
   * de arranque). El campo `host` se empezó a capturar el 2026-06-23; los
   * registros previos tienen host NULL y no aparecen aquí.
   * Excluye bots y, si está configurada, la IP del propietario.
   */
  getPorDominio: protectedProcedure
    .input(z.object({}))
    .query(async () => {
      await initializeDatabase();
      const client = getTursoClient();

      // IP del propietario para excluir el tráfico propio (mismo criterio
      // que el "Total Real" del resto del dashboard)
      const ipExcluida = await leerIpExcluida(client);

      // Rangos de fechas en hora Madrid (ordinal YYYYMMDD, igual que getResumen).
      // "7 días" = [hoy-6, hoy]: misma definición que el resto del dashboard.
      const hoy = hoyMadrid();
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const hace6Dias = new Date(hoy); hace6Dias.setDate(hoy.getDate() - 6);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ord = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
      const hoyOrd = ord(hoy), ayerOrd = ord(ayer), hace6Ord = ord(hace6Dias), iMesOrd = ord(inicioMes);

      const res = await client.execute({
        sql: `SELECT host,
                COUNT(*) AS total,
                SUM(CASE WHEN fo = ? THEN 1 ELSE 0 END) AS hoy,
                SUM(CASE WHEN fo = ? THEN 1 ELSE 0 END) AS ayer,
                SUM(CASE WHEN fo >= ? THEN 1 ELSE 0 END) AS semana,
                SUM(CASE WHEN fo >= ? THEN 1 ELSE 0 END) AS mes
              FROM (
                SELECT host, ${FECHA_EXPR} AS fo
                FROM uso_aplicaciones
                -- Excluye mcp además de bot (30/07/2026), igual que getNavegacion y que
                -- el universo U2 del rollup: una llamada MCP no es una visita a un
                -- dominio (no hay página) y ADEMÁS se registra siempre con
                -- host='meskeia.com', porque registrarUsoDelegum hace un fetch interno a
                -- meskeia.com/api/analytics/track. O sea que inflaba meskeia.com con
                -- tráfico que ni era visita ni era de ese dominio: el 30/07 el sondeador
                -- mcp-schema-probe/0.1 metió 68 llamadas ahí en un solo día.
                WHERE host IS NOT NULL AND host != '' AND modo NOT IN ('bot', 'mcp')
                  ${ipExcluida ? 'AND (ip_address != ? OR ip_address IS NULL)' : ''}
              )
              GROUP BY host
              ORDER BY total DESC`,
        args: ipExcluida
          ? [hoyOrd, ayerOrd, hace6Ord, iMesOrd, ipExcluida]
          : [hoyOrd, ayerOrd, hace6Ord, iMesOrd],
      });

      // Etiqueta e icono por dominio conocido; el resto se muestra tal cual
      const META: Record<string, { label: string; icono: string }> = {
        'meskeia.com': { label: 'meskeIA', icono: '🧩' },
        'delegum.com': { label: 'Delegum', icono: '🏛️' },
        'cronicum.com': { label: 'Cronicum', icono: '📜' },
        'stemum.com': { label: 'STEMUM', icono: '🔬' },
        'coquinum.com': { label: 'Coquinum', icono: '🍳' },
      };

      const filas = res.rows.map((r) => {
        const host = String(r.host);
        const meta = META[host] || { label: host, icono: '🌐' };
        return {
          host,
          label: meta.label,
          icono: meta.icono,
          hoy: Number(r.hoy),
          ayer: Number(r.ayer),
          semana: Number(r.semana),
          mes: Number(r.mes),
          total: Number(r.total),
        };
      });

      const total = filas.reduce(
        (acc, f) => ({
          hoy: acc.hoy + f.hoy,
          ayer: acc.ayer + f.ayer,
          semana: acc.semana + f.semana,
          mes: acc.mes + f.mes,
          total: acc.total + f.total,
        }),
        { hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 }
      );

      // ── Subdivisión de meskeia.com por vertical temático ──
      // Adjudica cada app servida bajo meskeia.com a UN vertical (exclusivo) para
      // ver el peso de cada portal AUNQUE el usuario entrara por la marca madre.
      // No mueve nada: es solo un contador. Cuadra con el total de meskeia.com y
      // comparte universo temporal con las filas por host (host≠NULL ⇒ desde 23/06).
      const subRes = await client.execute({
        sql: `SELECT aplicacion,
                COUNT(*) AS total,
                SUM(CASE WHEN fo = ? THEN 1 ELSE 0 END) AS hoy,
                SUM(CASE WHEN fo = ? THEN 1 ELSE 0 END) AS ayer,
                SUM(CASE WHEN fo >= ? THEN 1 ELSE 0 END) AS semana,
                SUM(CASE WHEN fo >= ? THEN 1 ELSE 0 END) AS mes
              FROM (
                SELECT aplicacion, ${FECHA_EXPR} AS fo
                FROM uso_aplicaciones
                -- Excluye mcp igual que la fila por host de arriba. OBLIGATORIO que
                -- ambas coincidan: si una cuenta las llamadas MCP y la otra no, las dos
                -- mitades de la MISMA tabla dejan de cuadrar y el descuadre aterriza
                -- entero en el cubo 'resto' (las pseudo-apps mcp:<servidor>:<tool> no se
                -- adjudican a ningún vertical). El 29/07/2026 eso inflaba meskeia-resto
                -- en 53: 312 en vez de 259, con el TOTAL ecosistema diciendo 527.
                WHERE host = 'meskeia.com' AND modo NOT IN ('bot', 'mcp')
                  ${ipExcluida ? 'AND (ip_address != ? OR ip_address IS NULL)' : ''}
              )
              GROUP BY aplicacion`,
        args: ipExcluida
          ? [hoyOrd, ayerOrd, hace6Ord, iMesOrd, ipExcluida]
          : [hoyOrd, ayerOrd, hace6Ord, iMesOrd],
      });

      type Periodos = { hoy: number; ayer: number; semana: number; mes: number; total: number };
      const nuevoP = (): Periodos => ({ hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 });
      const cubos: Record<string, Periodos> = {
        delegum: nuevoP(), stemum: nuevoP(), coquinum: nuevoP(), cronicum: nuevoP(), resto: nuevoP(),
      };
      for (const r of subRes.rows) {
        const c = cubos[verticalDe(String(r.aplicacion))];
        c.hoy += Number(r.hoy); c.ayer += Number(r.ayer); c.semana += Number(r.semana);
        c.mes += Number(r.mes); c.total += Number(r.total);
      }

      // % penetración del portal: cuánto del tráfico del vertical entra ya por su
      // dominio propio vs por meskeia.com. Sube con el tiempo si el portal gana
      // autoridad y Google empieza a servir la versión del dominio propio.
      const totalHost = (h: string) => filas.find((f) => f.host === h)?.total ?? 0;
      const SUB_META: Array<{ key: string; label: string; icono: string; host: string | null }> = [
        { key: 'delegum',  label: 'Delegum',       icono: '🏛️', host: 'delegum.com' },
        { key: 'stemum',   label: 'Stemum',        icono: '🔬', host: 'stemum.com' },
        { key: 'coquinum', label: 'Coquinum',      icono: '🍳', host: 'coquinum.com' },
        { key: 'cronicum', label: 'Cronicum',      icono: '📜', host: 'cronicum.com' },
        { key: 'resto',    label: 'Resto meskeIA', icono: '🧩', host: null },
      ];
      const subFilas = SUB_META.map((m) => {
        const c = cubos[m.key];
        const portal = m.host ? totalHost(m.host) : 0;
        const pctPortal = m.host && portal + c.total > 0
          ? Math.round((portal / (portal + c.total)) * 1000) / 10
          : null;
        return { key: m.key, label: m.label, icono: m.icono, portalHost: m.host, ...c, pctPortal };
      });
      const subtotal = Object.values(cubos).reduce((a, c) => ({
        hoy: a.hoy + c.hoy, ayer: a.ayer + c.ayer, semana: a.semana + c.semana,
        mes: a.mes + c.mes, total: a.total + c.total,
      }), nuevoP());

      return { filas, total, desde: '23/06/2026', subdivision: { filas: subFilas, subtotal } };
    }),
});
