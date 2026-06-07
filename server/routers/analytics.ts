/**
 * Router de Analytics para tRPC
 * Migra la lógica de /api/analytics/* a procedures type-safe
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getTursoClient, initializeDatabase, formatearDuracion } from '@/lib/turso';
import {
  agregarRegistros,
  computarRollupPendientes,
  leerIpExcluida,
  nuevoGlobal,
  CAMPOS_ROLLUP,
  FECHA_EXPR,
  type GlobalAcc,
} from '@/lib/analytics-rollup';

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
  input: { aplicacion?: string; desde?: string; hasta?: string; limite: number; excluir_mi_ip: boolean },
  ipConfigurada: string
) {
  const { limite, excluir_mi_ip } = input;
  const ipExcluida = excluir_mi_ip ? ipConfigurada : '';
  const soloResto = !!(excluir_mi_ip && ipConfigurada); // excluir es_miip=1
  const miipWhere = soloResto ? ' AND es_miip = 0' : '';
  const miipList: (0 | 1)[] = soloResto ? [0] : [0, 1];

  // On-demand defensivo: rellenar huecos de días cerrados (acotado para no bloquear)
  try { await computarRollupPendientes(client, ipConfigurada, 7); } catch { /* no bloquear la lectura */ }

  // Fechas (idénticas al cálculo original)
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
  const anteayer = new Date(hoy); anteayer.setDate(hoy.getDate() - 2);
  const hace7 = new Date(hoy); hace7.setDate(hoy.getDate() - 7);
  const hace14 = new Date(hoy); hace14.setDate(hoy.getDate() - 14);
  const iMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const iMesAnt = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const fMesAnt = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

  const ord = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const hoyOrd = ord(hoy), ayerOrd = ord(ayer), anteayerOrd = ord(anteayer);
  const hace7Ord = ord(hace7), hace14Ord = ord(hace14);
  const iMesOrd = ord(iMes), iMesAntOrd = ord(iMesAnt), fMesAntOrd = ord(fMesAnt);
  const fechasVivas = [ayerOrd, hoyOrd];

  const formatoEspanol = (f: Date): string =>
    `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${f.getFullYear()}`;

  // ── Lecturas: todas independientes → en PARALELO (1 round-trip de latencia,
  //    no ~10 secuenciales). Todas son baratas (tablas rollup pequeñas + ventana
  //    viva de 2 días + registros recientes por PK). ──
  let muSql = `SELECT MIN(timestamp) pu, MAX(timestamp) uu FROM uso_aplicaciones WHERE 1=1`;
  const muArgs: string[] = [];
  if (ipExcluida) { muSql += ' AND (ip_address IS NULL OR ip_address != ?)'; muArgs.push(ipExcluida); }

  let regSql = 'SELECT * FROM uso_aplicaciones WHERE 1=1';
  const regArgs: (string | number)[] = [];
  if (ipExcluida) { regSql += ' AND (ip_address IS NULL OR ip_address != ?)'; regArgs.push(ipExcluida); }
  regSql += ' ORDER BY id DESC LIMIT ?'; regArgs.push(limite);

  const [vivoRes, gcRes, appsAcumRes, muRes, rankRes, paisRes, ciudadRes, compRes, appsSemCerrRes, appsMesCerrRes, registrosResult] = await Promise.all([
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
      args: [anteayerOrd, hace7Ord, anteayerOrd, hace14Ord, hace7Ord, iMesOrd, anteayerOrd, iMesAntOrd, fMesAntOrd],
    }),
    client.execute({ sql: `SELECT DISTINCT aplicacion FROM rollup_dia_app WHERE fecha_ord BETWEEN ? AND ?${miipWhere}`, args: [hace7Ord, anteayerOrd] }),
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
  const rankingAplicaciones = [...rankMap.entries()]
    .map(([aplicacion, a]) => {
      const usos = a.usos;
      let estado = '⚠️ Muy bajo';
      if (usos >= 50) estado = '✅ Activa'; else if (usos >= 10) estado = '⚠️ Bajo uso';
      const raw = a.ult;
      const ultimoUso = raw.length === 8 ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}` : raw;
      const durProm = a.cdc > 0 ? a.sdc / a.cdc : 0;
      return {
        aplicacion, total_usos: usos, ultimo_uso: ultimoUso,
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
  const usosSemana = Number(cc.sem_cerr) + vivoUsos([ayerOrd, hoyOrd]);
  const usosSemanaAnt = Number(cc.sem_ant);
  const usosMes = Number(cc.mes_cerr) + vivoUsos([ayerOrd, hoyOrd]);
  const usosMesAnt = Number(cc.mes_ant);

  // apps_distintas por período (cerrado por rango ya leído en paralelo + vivo)
  const appsHoy = appsVivo([hoyOrd]).size;
  const appsAyer = appsVivo([ayerOrd]).size;
  const setSem = appsVivo([ayerOrd, hoyOrd]); for (const r of appsSemCerrRes.rows) setSem.add(String(r.aplicacion));
  const setMes = appsVivo([ayerOrd, hoyOrd]); for (const r of appsMesCerrRes.rows) setMes.add(String(r.aplicacion));

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
  const registros = registrosResult.rows.map((row) => ({
    ...row,
    modo: (row.modo as string | null) ?? 'web',
    datos_adicionales: row.datos_adicionales ? JSON.parse(row.datos_adicionales as string) : null,
  }));

  return {
    status: 'success',
    version: 'v4-rollup',
    filtros: {
      aplicacion: input.aplicacion, desde: input.desde, hasta: input.hasta,
      limite, excluir_mi_ip, ip_excluida: ipExcluida || null,
    },
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
   * Obtiene estadísticas de uso con filtros opcionales
   * Reemplaza: GET /api/analytics/stats
   */
  getStats: publicProcedure
    .input(
      z.object({
        aplicacion: z.string().optional(),
        desde: z.string().optional(),
        hasta: z.string().optional(),
        limite: z.number().int().positive().default(100),
        excluir_mi_ip: z.boolean().default(false),
      })
    )
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      const { aplicacion, desde, hasta, limite, excluir_mi_ip } = input;

      // RUTA RÁPIDA: sin filtros de app/fecha (caso del dashboard) → vía rollup.
      // Con filtros, se mantiene el cálculo en vivo de más abajo (fallback).
      if (!aplicacion && !desde && !hasta) {
        const ipConfigurada = await leerIpExcluida(client);
        return await getStatsPorRollup(client, input, ipConfigurada);
      }

      // Obtener IP excluida si el filtro está activo
      let ipExcluida = '';
      if (excluir_mi_ip) {
        try {
          const configResult = await client.execute({
            sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
            args: [],
          });
          if (configResult.rows.length > 0) {
            ipExcluida = String(configResult.rows[0].valor);
          }
        } catch {
          // Ignorar error si la tabla no existe aún
        }
      }

      // Construir query con filtros
      let sql = 'SELECT * FROM uso_aplicaciones WHERE 1=1';
      const args: (string | number)[] = [];

      if (aplicacion) {
        sql += ' AND aplicacion = ?';
        args.push(aplicacion);
      }
      if (desde) {
        sql += ' AND timestamp >= ?';
        args.push(desde);
      }
      if (hasta) {
        sql += ' AND timestamp <= ?';
        args.push(hasta);
      }
      if (ipExcluida) {
        sql += ' AND (ip_address IS NULL OR ip_address != ?)';
        args.push(ipExcluida);
      }

      sql += ' ORDER BY id DESC LIMIT ?';
      args.push(limite);

      const registrosResult = await client.execute({ sql, args });
      const registros = registrosResult.rows.map((row) => ({
        ...row,
        modo: (row.modo as string | null) ?? 'web',
        datos_adicionales: row.datos_adicionales
          ? JSON.parse(row.datos_adicionales as string)
          : null,
      }));

      // Estadísticas agregadas
      let sqlStats = `
        SELECT
          COUNT(*) as total_usos,
          COUNT(DISTINCT aplicacion) as total_aplicaciones,
          MIN(timestamp) as primer_uso,
          MAX(timestamp) as ultimo_uso,
          AVG(CASE WHEN duracion_segundos IS NOT NULL THEN duracion_segundos END) as duracion_promedio,
          SUM(CASE WHEN tipo_dispositivo = 'movil' THEN 1 ELSE 0 END) as total_movil,
          SUM(CASE WHEN tipo_dispositivo = 'escritorio' THEN 1 ELSE 0 END) as total_escritorio,
          SUM(CASE WHEN es_recurrente = 1 THEN 1 ELSE 0 END) as total_recurrentes,
          SUM(CASE WHEN es_recurrente = 0 THEN 1 ELSE 0 END) as total_nuevos
        FROM uso_aplicaciones WHERE 1=1
      `;
      const statsArgs: string[] = [];

      if (aplicacion) {
        sqlStats += ' AND aplicacion = ?';
        statsArgs.push(aplicacion);
      }
      if (desde) {
        sqlStats += ' AND timestamp >= ?';
        statsArgs.push(desde);
      }
      if (hasta) {
        sqlStats += ' AND timestamp <= ?';
        statsArgs.push(hasta);
      }
      if (ipExcluida) {
        sqlStats += ' AND (ip_address IS NULL OR ip_address != ?)';
        statsArgs.push(ipExcluida);
      }

      const statsResult = await client.execute({ sql: sqlStats, args: statsArgs });
      const stats = statsResult.rows[0];

      const total = Number(stats.total_usos) || 0;
      const totalMovil = Number(stats.total_movil) || 0;
      const totalEscritorio = Number(stats.total_escritorio) || 0;
      const totalRecurrentes = Number(stats.total_recurrentes) || 0;
      const totalNuevos = Number(stats.total_nuevos) || 0;
      const duracionPromedio = Number(stats.duracion_promedio) || 0;

      const porcentajeMovil = total > 0 ? Math.round((totalMovil / total) * 1000) / 10 : 0;
      const porcentajeEscritorio = total > 0 ? Math.round((totalEscritorio / total) * 1000) / 10 : 0;
      const porcentajeRecurrentes = total > 0 ? Math.round((totalRecurrentes / total) * 1000) / 10 : 0;

      // Ranking de aplicaciones (con filtro de IP si está activo)
      // - ultimo_uso: MAX sobre "YYYYMMDD" (reordenando substr) → ordena correctamente entre meses
      //   sin subconsulta correlacionada (que causaba N queries por app → lentitud crítica)
      // - duracion_promedio excluye sesiones > 2h (7200s) para evitar distorsión por tabs abandonadas
      let rankingSql = `
        SELECT
          u1.aplicacion,
          COUNT(*) as total_usos,
          MAX(substr(u1.timestamp,7,4) || substr(u1.timestamp,4,2) || substr(u1.timestamp,1,2)) as ultimo_uso,
          AVG(CASE WHEN u1.duracion_segundos IS NOT NULL AND u1.duracion_segundos <= 7200
              THEN u1.duracion_segundos END) as duracion_promedio_segundos
        FROM uso_aplicaciones u1
        WHERE 1=1
      `;
      const rankingArgs: string[] = [];
      if (ipExcluida) {
        rankingSql += ' AND (u1.ip_address IS NULL OR u1.ip_address != ?)';
        rankingArgs.push(ipExcluida);
      }
      rankingSql += ' GROUP BY u1.aplicacion ORDER BY total_usos DESC';

      const rankingResult = await client.execute({ sql: rankingSql, args: rankingArgs });

      const rankingAplicaciones = rankingResult.rows.map((app) => {
        const usos = Number(app.total_usos);
        let estado = '⚠️ Muy bajo';
        if (usos >= 50) estado = '✅ Activa';
        else if (usos >= 10) estado = '⚠️ Bajo uso';

        // Convertir "20260602" (YYYYMMDD) → "02/06/2026" para mostrar
        const raw = String(app.ultimo_uso || '');
        const ultimo_uso = raw.length === 8
          ? `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)}`
          : raw;

        return {
          aplicacion: app.aplicacion,
          total_usos: usos,
          ultimo_uso,
          duracion_promedio_segundos: Number(app.duracion_promedio_segundos) || 0,
          duracion_promedio_formato: formatearDuracion(
            Math.round(Number(app.duracion_promedio_segundos) || 0)
          ),
          estado,
        };
      });

      // Estadísticas geográficas (con filtro de IP si está activo)
      // CASE normaliza nombres completos históricos ("Spain") a código ISO ("ES")
      let paisesSql = `
        SELECT
          CASE pais
            WHEN 'Spain' THEN 'ES'
            WHEN 'United States' THEN 'US'
            WHEN 'Mexico' THEN 'MX'
            WHEN 'Argentina' THEN 'AR'
            WHEN 'Colombia' THEN 'CO'
            WHEN 'Bolivia' THEN 'BO'
            WHEN 'Ecuador' THEN 'EC'
            WHEN 'Chile' THEN 'CL'
            WHEN 'Peru' THEN 'PE'
            WHEN 'Venezuela' THEN 'VE'
            WHEN 'Guatemala' THEN 'GT'
            WHEN 'Costa Rica' THEN 'CR'
            WHEN 'Honduras' THEN 'HN'
            WHEN 'El Salvador' THEN 'SV'
            WHEN 'Nicaragua' THEN 'NI'
            WHEN 'Panama' THEN 'PA'
            WHEN 'Cuba' THEN 'CU'
            WHEN 'Dominican Republic' THEN 'DO'
            WHEN 'Puerto Rico' THEN 'PR'
            WHEN 'Uruguay' THEN 'UY'
            WHEN 'Paraguay' THEN 'PY'
            WHEN 'Brazil' THEN 'BR'
            WHEN 'Portugal' THEN 'PT'
            WHEN 'France' THEN 'FR'
            WHEN 'Germany' THEN 'DE'
            WHEN 'United Kingdom' THEN 'GB'
            WHEN 'Italy' THEN 'IT'
            WHEN 'Netherlands' THEN 'NL'
            WHEN 'Belgium' THEN 'BE'
            WHEN 'Switzerland' THEN 'CH'
            WHEN 'Sweden' THEN 'SE'
            WHEN 'Norway' THEN 'NO'
            WHEN 'Denmark' THEN 'DK'
            WHEN 'Finland' THEN 'FI'
            WHEN 'Poland' THEN 'PL'
            WHEN 'Russia' THEN 'RU'
            WHEN 'Turkey' THEN 'TR'
            WHEN 'Canada' THEN 'CA'
            WHEN 'Australia' THEN 'AU'
            WHEN 'Japan' THEN 'JP'
            WHEN 'China' THEN 'CN'
            WHEN 'India' THEN 'IN'
            WHEN 'South Korea' THEN 'KR'
            ELSE pais
          END as pais,
          COUNT(*) as total
        FROM uso_aplicaciones
        WHERE pais IS NOT NULL AND pais != ''
      `;
      const paisesArgs: string[] = [];
      if (ipExcluida) {
        paisesSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        paisesArgs.push(ipExcluida);
      }
      paisesSql += ' GROUP BY 1 ORDER BY total DESC LIMIT 20';
      const paisesResult = await client.execute({ sql: paisesSql, args: paisesArgs });

      let ciudadesSql = `
        SELECT ciudad, COUNT(*) as total
        FROM uso_aplicaciones
        WHERE ciudad IS NOT NULL AND ciudad != ''
      `;
      const ciudadesArgs: string[] = [];
      if (ipExcluida) {
        ciudadesSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        ciudadesArgs.push(ipExcluida);
      }
      ciudadesSql += ' GROUP BY ciudad ORDER BY total DESC LIMIT 10';
      const ciudadesResult = await client.execute({ sql: ciudadesSql, args: ciudadesArgs });

      // Comparativa temporal
      const formatoEspanol = (fecha: Date): string => {
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
      };

      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const hace7Dias = new Date(hoy); hace7Dias.setDate(hoy.getDate() - 7);
      const hace14Dias = new Date(hoy); hace14Dias.setDate(hoy.getDate() - 14);
      const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

      // Comparativa temporal consolidada en UNA sola consulta (antes eran 7 round-trips).
      // Agregación condicional sobre la fecha reordenada a YYYYMMDD. Las claves de fecha
      // son valores generados en servidor (8 dígitos), seguras para embeber en el SQL.
      // El WHERE fo >= inicioMesAnterior limita el escaneo al rango necesario.
      const anteayer = new Date(hoy); anteayer.setDate(hoy.getDate() - 2);
      const fmtOrd = (f: Date) =>
        `${f.getFullYear()}${String(f.getMonth() + 1).padStart(2, '0')}${String(f.getDate()).padStart(2, '0')}`;
      const hoyS = fmtOrd(hoy), ayerS = fmtOrd(ayer), anteayerS = fmtOrd(anteayer);
      const hace7S = fmtOrd(hace7Dias), hace14S = fmtOrd(hace14Dias);
      const iMesS = fmtOrd(inicioMesActual), iMesAntS = fmtOrd(inicioMesAnterior), fMesAntS = fmtOrd(finMesAnterior);

      let compSql = `
        SELECT
          SUM(CASE WHEN fo = '${hoyS}' THEN 1 ELSE 0 END) as usos_hoy,
          SUM(CASE WHEN fo = '${ayerS}' THEN 1 ELSE 0 END) as usos_ayer,
          SUM(CASE WHEN fo = '${anteayerS}' THEN 1 ELSE 0 END) as usos_anteayer,
          SUM(CASE WHEN fo >= '${hace7S}' AND fo <= '${hoyS}' THEN 1 ELSE 0 END) as usos_semana,
          SUM(CASE WHEN fo >= '${hace14S}' AND fo <= '${hace7S}' THEN 1 ELSE 0 END) as usos_semana_ant,
          SUM(CASE WHEN fo >= '${iMesS}' AND fo <= '${hoyS}' THEN 1 ELSE 0 END) as usos_mes,
          SUM(CASE WHEN fo >= '${iMesAntS}' AND fo <= '${fMesAntS}' THEN 1 ELSE 0 END) as usos_mes_ant,
          COUNT(DISTINCT CASE WHEN fo = '${hoyS}' THEN aplicacion END) as apps_hoy,
          COUNT(DISTINCT CASE WHEN fo = '${ayerS}' THEN aplicacion END) as apps_ayer,
          COUNT(DISTINCT CASE WHEN fo >= '${hace7S}' AND fo <= '${hoyS}' THEN aplicacion END) as apps_semana,
          COUNT(DISTINCT CASE WHEN fo >= '${iMesS}' AND fo <= '${hoyS}' THEN aplicacion END) as apps_mes
        FROM (
          SELECT
            substr(timestamp,7,4) || substr(timestamp,4,2) || substr(timestamp,1,2) as fo,
            aplicacion, ip_address
          FROM uso_aplicaciones
        )
        WHERE fo >= '${iMesAntS}'
      `;
      const compArgs: string[] = [];
      if (ipExcluida) {
        compSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        compArgs.push(ipExcluida);
      }
      const compRes = await client.execute({ sql: compSql, args: compArgs });
      const cmp = compRes.rows[0];

      const rHoy = { usos: Number(cmp.usos_hoy) || 0, apps: Number(cmp.apps_hoy) || 0 };
      const rAyer = { usos: Number(cmp.usos_ayer) || 0, apps: Number(cmp.apps_ayer) || 0 };
      const rSemana = { usos: Number(cmp.usos_semana) || 0, apps: Number(cmp.apps_semana) || 0 };
      const rMes = { usos: Number(cmp.usos_mes) || 0, apps: Number(cmp.apps_mes) || 0 };
      const usosHoy = rHoy.usos;
      const usosAyer = rAyer.usos;
      const usosUltimos7Dias = rSemana.usos;
      const usosSemanaAnterior = Number(cmp.usos_semana_ant) || 0;
      const usosMesActual = rMes.usos;
      const usosMesAnterior = Number(cmp.usos_mes_ant) || 0;
      const usosAnteayer = Number(cmp.usos_anteayer) || 0;

      const calcularVariacion = (actual: number, anterior: number) => {
        if (anterior === 0) {
          return { porcentaje: actual > 0 ? 100 : 0, tendencia: actual > 0 ? ('up' as const) : ('neutral' as const) };
        }
        const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
        const tendencia = porcentaje > 0 ? ('up' as const) : porcentaje < 0 ? ('down' as const) : ('neutral' as const);
        return { porcentaje: Math.abs(porcentaje), tendencia };
      };

      // Visitas que llegaron por un enlace compartido (?ref=share)
      let sharesSql = `
        SELECT COUNT(*) as total
        FROM uso_aplicaciones
        WHERE datos_adicionales LIKE '%"ref":"share"%'
      `;
      const sharesArgs: string[] = [];
      if (ipExcluida) {
        sharesSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        sharesArgs.push(ipExcluida);
      }
      const sharesResult = await client.execute({ sql: sharesSql, args: sharesArgs });
      const totalPorCompartir = Number(sharesResult.rows[0]?.total) || 0;

      const comparativa = {
        hoy: {
          usos: usosHoy,
          apps_distintas: rHoy.apps,
          comparacion: calcularVariacion(usosHoy, usosAyer),
          etiqueta: 'vs ayer',
        },
        ayer: {
          usos: usosAyer,
          apps_distintas: rAyer.apps,
          comparacion: calcularVariacion(usosAyer, usosAnteayer),
          etiqueta: 'vs anteayer',
          fecha: formatoEspanol(ayer),
        },
        semana: {
          usos: usosUltimos7Dias,
          apps_distintas: rSemana.apps,
          comparacion: calcularVariacion(usosUltimos7Dias, usosSemanaAnterior),
          etiqueta: 'vs semana anterior',
        },
        mes: {
          usos: usosMesActual,
          apps_distintas: rMes.apps,
          comparacion: calcularVariacion(usosMesActual, usosMesAnterior),
          etiqueta: 'vs mes anterior',
        },
        detalles: {
          ayer: usosAyer,
          anteayer: usosAnteayer,
          semanaAnterior: usosSemanaAnterior,
          mesAnterior: usosMesAnterior,
        },
      };

      return {
        status: 'success',
        version: 'v3.2-trpc',
        filtros: {
          aplicacion,
          desde,
          hasta,
          limite,
          excluir_mi_ip,
          ip_excluida: ipExcluida || null,
        },
        estadisticas: {
          total_usos: total,
          total_aplicaciones: Number(stats.total_aplicaciones) || 0,
          primer_uso: stats.primer_uso,
          ultimo_uso: stats.ultimo_uso,
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
          geografia: {
            paises: paisesResult.rows,
            ciudades: ciudadesResult.rows,
          },
        },
        comparativa,
        registros_mostrados: registros.length,
        ranking_aplicaciones: rankingAplicaciones,
        data: registros,
      };
    }),

  /**
   * Procedure: getAppStats
   * Estadísticas completas de una app específica (sin límite de 500 registros)
   * Reemplaza el filtrado client-side de datos.data en la pestaña Por Aplicación
   */
  getAppStats: publicProcedure
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

      // Fecha de hoy en formato DD/MM/YYYY para filtrar con LIKE (evita el bug de MAX string)
      const ahora = new Date();
      const fechaHoy = `${String(ahora.getDate()).padStart(2, '0')}/${String(ahora.getMonth() + 1).padStart(2, '0')}/${ahora.getFullYear()}`;

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

      return {
        usos_hoy: Number(todayResult.rows[0]?.total) || 0,
        dispositivos: { movil, escritorio },
        registros: registrosResult.rows,
      };
    }),

  /**
   * Procedure: getResumen
   * Devuelve tabla de usos desglosada por origen (Web, IA por plataforma, MCP, Bots, Mi IP)
   * y período (Hoy, Ayer, 7 días, Este mes, Total)
   */
  getResumen: publicProcedure
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

      // Obtener todos los registros (solo campos necesarios)
      const result = await client.execute({
        sql: `SELECT timestamp, modo, datos_adicionales, ip_address FROM uso_aplicaciones ORDER BY id DESC`,
        args: [],
      });

      // Rangos de fechas (inicio del día, sin hora)
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
      const hace7Dias = new Date(hoy); hace7Dias.setDate(hoy.getDate() - 7);
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      // Parsear timestamp español "DD/MM/YYYY, HH:MM:SS" → Date (solo fecha)
      const parsearFecha = (ts: string): Date | null => {
        const m = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!m) return null;
        return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
      };

      type Conteo = { hoy: number; ayer: number; semana: number; mes: number; total: number };
      const conteos: Record<string, Conteo> = {};
      const nuevaFila = (): Conteo => ({ hoy: 0, ayer: 0, semana: 0, mes: 0, total: 0 });

      // Plataformas IA conocidas (en orden de visualización)
      const PLATAFORMAS_IA = [
        'claude.ai',
        'perplexity.ai',
        'chatgpt.com',
        'gemini.google.com',
        'copilot.microsoft.com',
        'you.com',
        'phind.com',
        'poe.com',
      ];

      // Pre-inicializar todas las filas conocidas
      ['web', ...PLATAFORMAS_IA, 'ia-sin-detalle', 'mcp', 'bot', 'mi-ip'].forEach(
        (k) => { conteos[k] = nuevaFila(); }
      );

      for (const row of result.rows) {
        const ts = String(row.timestamp || '');
        const fecha = parsearFecha(ts);
        if (!fecha) continue;

        const modo = String(row.modo || 'web');
        const ip = String(row.ip_address || '');

        let datosAd: Record<string, string> | null = null;
        try {
          if (row.datos_adicionales) {
            datosAd = JSON.parse(String(row.datos_adicionales));
          }
        } catch { /* ignorar JSON inválido */ }

        // Clasificar origen
        let origen: string;
        if (ipExcluida && ip === ipExcluida) {
          origen = 'mi-ip';
        } else if (modo === 'bot') {
          origen = 'bot';
        } else if (modo === 'mcp') {
          origen = 'mcp';
        } else if (modo === 'referral-ia') {
          const hostname = datosAd?.referrer_ia || null;
          if (hostname && PLATAFORMAS_IA.includes(hostname)) {
            origen = hostname;
          } else if (hostname) {
            // Plataforma IA desconocida — agregar dinámicamente
            if (!conteos[hostname]) conteos[hostname] = nuevaFila();
            origen = hostname;
          } else {
            origen = 'ia-sin-detalle';
          }
        } else {
          origen = 'web';
        }

        // Acumular en los períodos que corresponda
        const c = conteos[origen];
        if (fecha >= hoy)      c.hoy++;
        if (fecha >= ayer && fecha < hoy) c.ayer++;
        if (fecha >= hace7Dias) c.semana++;
        if (fecha >= inicioMes) c.mes++;
        c.total++;
      }

      // Construir filas en orden fijo
      const filasOrden: Array<{ key: string; label: string; icono: string; grupo: string }> = [
        { key: 'web',                   label: 'Web',               icono: '🌐', grupo: 'web' },
        { key: 'claude.ai',             label: 'claude.ai',         icono: '🤖', grupo: 'ia' },
        { key: 'perplexity.ai',         label: 'perplexity.ai',     icono: '🤖', grupo: 'ia' },
        { key: 'chatgpt.com',           label: 'chatgpt.com',       icono: '🤖', grupo: 'ia' },
        { key: 'gemini.google.com',     label: 'gemini.google',     icono: '🤖', grupo: 'ia' },
        { key: 'copilot.microsoft.com', label: 'copilot',           icono: '🤖', grupo: 'ia' },
        { key: 'you.com',               label: 'you.com',           icono: '🤖', grupo: 'ia' },
        { key: 'phind.com',             label: 'phind.com',         icono: '🤖', grupo: 'ia' },
        { key: 'poe.com',               label: 'poe.com',           icono: '🤖', grupo: 'ia' },
        { key: 'ia-sin-detalle',        label: 'IA sin detalle',    icono: '🤖', grupo: 'ia' },
        { key: 'mcp',                   label: 'IA / MCP',          icono: '🔗', grupo: 'mcp' },
        { key: 'bot',                   label: 'Bots',              icono: '🕷️', grupo: 'bot' },
        { key: 'mi-ip',                 label: 'Mi IP',             icono: '🏠', grupo: 'miip' },
      ];

      // Añadir plataformas IA desconocidas que hayan aparecido en los datos
      const conocidas = new Set(filasOrden.map(f => f.key));
      for (const key of Object.keys(conteos)) {
        if (!conocidas.has(key) && conteos[key].total > 0) {
          filasOrden.splice(
            filasOrden.findIndex(f => f.key === 'ia-sin-detalle'),
            0,
            { key, label: key, icono: '🤖', grupo: 'ia' }
          );
        }
      }

      const filas = filasOrden.map(({ key, label, icono, grupo }) => ({
        origen: label,
        icono,
        grupo,
        ...(conteos[key] || nuevaFila()),
      }));

      // Total Real = todo excepto Bots y Mi IP
      const excluirDeTotalReal = new Set(['bot', 'mi-ip']);
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
  getTendencia30Dias: publicProcedure
    .input(z.object({ excluir_mi_ip: z.boolean().default(false) }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      let ipExcluida = '';
      if (input.excluir_mi_ip) {
        try {
          const cfg = await client.execute({
            sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`,
            args: [],
          });
          if (cfg.rows.length > 0) ipExcluida = String(cfg.rows[0].valor);
        } catch { /* ignorar */ }
      }

      // Fecha de hace 29 días (para incluir hoy = 30 días en total), en formato YYYYMMDD
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - 29);
      const inicioStr = `${inicio.getFullYear()}${String(inicio.getMonth() + 1).padStart(2, '0')}${String(inicio.getDate()).padStart(2, '0')}`;

      // Agrupar por día usando la clave YYYYMMDD (ordena bien entre meses y años)
      let sql = `
        SELECT
          substr(timestamp, 7, 4) || substr(timestamp, 4, 2) || substr(timestamp, 1, 2) AS fecha_ord,
          COUNT(*) AS usos
        FROM uso_aplicaciones
        WHERE substr(timestamp, 7, 4) || substr(timestamp, 4, 2) || substr(timestamp, 1, 2) >= ?
      `;
      const args: string[] = [inicioStr];

      if (ipExcluida) {
        sql += ' AND (ip_address IS NULL OR ip_address != ?)';
        args.push(ipExcluida);
      }

      sql += ' GROUP BY fecha_ord ORDER BY fecha_ord ASC';

      const result = await client.execute({ sql, args });

      // Mapa YYYYMMDD → usos
      const mapaUsos: Record<string, number> = {};
      for (const row of result.rows) {
        mapaUsos[String(row.fecha_ord)] = Number(row.usos);
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
  getIPConfig: publicProcedure
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
  updateIPFilter: publicProcedure
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
  getNavegacion: publicProcedure
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

      // Calcular fecha límite (hace N días)
      const ahora = new Date();
      const limite = new Date(ahora);
      limite.setDate(limite.getDate() - input.dias);

      // Cargar visitas relevantes ordenadas por sesión y momento
      // Excluimos bot, mcp y mi-ip ya en SQL para reducir ruido
      const result = await client.execute({
        sql: `SELECT id, aplicacion, sesion_id, modo, datos_adicionales, ip_address, timestamp
              FROM uso_aplicaciones
              WHERE sesion_id IS NOT NULL AND sesion_id != ''
                AND modo NOT IN ('bot', 'mcp')
                ${ipExcluida ? 'AND (ip_address != ? OR ip_address IS NULL)' : ''}
              ORDER BY sesion_id ASC, id ASC`,
        args: ipExcluida ? [ipExcluida] : [],
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
        distribucionLongitud: distribLongitud,
        topPares,
        tablaPuente,
      };
    }),

  /**
   * Procedure: getTendencias
   * Devuelve tendencia mensual 2026, desglose por canal y % LATAM mes actual vs anterior.
   */
  getTendencias: publicProcedure
    .input(z.object({ excluir_mi_ip: z.boolean().default(false) }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      let ipExcluida = '';
      if (input.excluir_mi_ip) {
        try {
          const r = await client.execute({ sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`, args: [] });
          if (r.rows.length > 0) ipExcluida = String(r.rows[0].valor);
        } catch { /* ignorar */ }
      }

      const ahora = new Date();
      const mesActual = String(ahora.getMonth() + 1).padStart(2, '0');
      const anioActual = String(ahora.getFullYear());
      const mesAnteriorDate = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const mesAnterior = String(mesAnteriorDate.getMonth() + 1).padStart(2, '0');
      const anioAnterior = String(mesAnteriorDate.getFullYear());

      const ipFiltro = ipExcluida
        ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ipExcluida}')`
        : ` AND (es_propio IS NULL OR es_propio = 0)`;
      const botFiltro = ` AND modo NOT IN ('bot', 'mcp')`;

      // 1. Evolución mensual 2026
      const mensualRes = await client.execute({
        sql: `
          SELECT
            substr(timestamp,7,4) || '-' || substr(timestamp,4,2) as mes,
            COUNT(*) as visitas,
            COUNT(DISTINCT sesion_id) as sesiones,
            COUNT(DISTINCT pais) as paises
          FROM uso_aplicaciones
          WHERE substr(timestamp,7,4) = '${anioActual}'
            ${ipFiltro}${botFiltro}
          GROUP BY mes
          ORDER BY mes
        `,
        args: [],
      });

      // 2. Canal de tráfico mes actual
      const canalRes = await client.execute({
        sql: `
          SELECT
            CASE
              WHEN modo = 'referral-ia' THEN 'ia'
              WHEN modo = 'referral-social' THEN 'social'
              WHEN modo = 'pwa' THEN 'pwa'
              ELSE 'web'
            END as canal,
            COUNT(*) as visitas
          FROM uso_aplicaciones
          WHERE substr(timestamp,7,4) = '${anioActual}'
            AND substr(timestamp,4,2) = '${mesActual}'
            ${ipFiltro}${botFiltro}
          GROUP BY canal
          ORDER BY visitas DESC
        `,
        args: [],
      });

      // 3. % LATAM mes actual y mes anterior
      const paisesLatam = `'MX','CO','AR','BO','EC','PE','CL','CR','VE','UY','PY','GT','HN','SV','NI','DO','CU','PA','PR'`;
      const latamRes = await client.execute({
        sql: `
          SELECT
            substr(timestamp,7,4) || '-' || substr(timestamp,4,2) as mes,
            COUNT(*) as total,
            SUM(CASE WHEN pais IN (${paisesLatam}) THEN 1 ELSE 0 END) as latam
          FROM uso_aplicaciones
          WHERE (
            (substr(timestamp,7,4) = '${anioActual}' AND substr(timestamp,4,2) = '${mesActual}')
            OR (substr(timestamp,7,4) = '${anioAnterior}' AND substr(timestamp,4,2) = '${mesAnterior}')
          )
          ${ipFiltro}${botFiltro}
          GROUP BY mes
          ORDER BY mes
        `,
        args: [],
      });

      const latamPorMes = latamRes.rows.map(r => ({
        mes: String(r.mes),
        total: Number(r.total),
        latam: Number(r.latam),
        pct: Number(r.total) > 0 ? Math.round((Number(r.latam) / Number(r.total)) * 1000) / 10 : 0,
      }));

      return {
        mensual: mensualRes.rows.map(r => ({
          mes: String(r.mes),
          visitas: Number(r.visitas),
          sesiones: Number(r.sesiones),
          paises: Number(r.paises),
        })),
        canales: Object.fromEntries(
          canalRes.rows.map(r => [String(r.canal), Number(r.visitas)])
        ) as Record<string, number>,
        latam: latamPorMes,
      };
    }),

  /**
   * Distribución de duraciones de visita
   * Buckets: sin registro (NULL) / 2-30s / 30s-2min / 2-10min / >10min
   */
  getDistribucionDuraciones: publicProcedure
    .input(z.object({ excluir_mi_ip: z.boolean().default(false) }))
    .query(async ({ input }) => {
      await initializeDatabase();
      const client = getTursoClient();

      let ipExcluida = '';
      if (input.excluir_mi_ip) {
        try {
          const r = await client.execute({ sql: `SELECT valor FROM analytics_config WHERE clave = 'ip_excluida'`, args: [] });
          if (r.rows.length > 0) ipExcluida = String(r.rows[0].valor);
        } catch { /* ignorar */ }
      }

      const ipFiltro = ipExcluida
        ? ` AND (es_propio IS NULL OR es_propio = 0) AND (ip_address IS NULL OR ip_address != '${ipExcluida}')`
        : ` AND (es_propio IS NULL OR es_propio = 0)`;
      const botFiltro = ` AND modo NOT IN ('bot', 'mcp')`;

      const res = await client.execute({
        sql: `
          SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN duracion_segundos IS NULL THEN 1 END) as sin_registro,
            COUNT(CASE WHEN duracion_segundos IS NOT NULL AND duracion_segundos <= 30 THEN 1 END) as rebote,
            COUNT(CASE WHEN duracion_segundos > 30 AND duracion_segundos <= 120 THEN 1 END) as corta,
            COUNT(CASE WHEN duracion_segundos > 120 AND duracion_segundos <= 600 THEN 1 END) as media,
            COUNT(CASE WHEN duracion_segundos > 600 THEN 1 END) as larga
          FROM uso_aplicaciones
          WHERE 1=1 ${ipFiltro}${botFiltro}
        `,
        args: [],
      });

      const topRes = await client.execute({
        sql: `
          SELECT
            aplicacion,
            COUNT(*) as total_usos,
            COUNT(CASE WHEN duracion_segundos IS NOT NULL THEN 1 END) as con_duracion,
            CAST(ROUND(AVG(CASE WHEN duracion_segundos IS NOT NULL THEN duracion_segundos END)) AS INTEGER) as duracion_media,
            MAX(duracion_segundos) as duracion_max
          FROM uso_aplicaciones
          WHERE 1=1 ${ipFiltro}${botFiltro}
          GROUP BY aplicacion
          HAVING con_duracion >= 3
          ORDER BY duracion_media DESC
          LIMIT 100
        `,
        args: [],
      });

      const row = res.rows[0];
      const total = Number(row.total);
      const pct = (n: number) => total > 0 ? Math.round(n / total * 1000) / 10 : 0;

      const sinRegistro = Number(row.sin_registro);
      const rebote = Number(row.rebote);
      const corta = Number(row.corta);
      const media = Number(row.media);
      const larga = Number(row.larga);

      return {
        total,
        buckets: [
          { label: 'Sin registro', descripcion: 'Visita < 2s o sin evento de salida', valor: sinRegistro, pct: pct(sinRegistro), color: '#9ca3af' },
          { label: '2 – 30s',      descripcion: 'Rebote rápido',                       valor: rebote,      pct: pct(rebote),      color: '#f59e0b' },
          { label: '30s – 2min',   descripcion: 'Exploración',                          valor: corta,       pct: pct(corta),       color: '#3b82f6' },
          { label: '2 – 10min',    descripcion: 'Uso real',                             valor: media,       pct: pct(media),       color: '#10b981' },
          { label: '> 10min',      descripcion: 'Uso intensivo',                        valor: larga,       pct: pct(larga),       color: '#8b5cf6' },
        ],
        // Ordenación por índice de engagement combinado:
        //   MIN(duracion, 30min) × cobertura × log10(1 + con_duracion)
        // Evita que pestañas olvidadas (pocas sesiones, tiempo enorme) dominen el ranking.
        topPorDuracion: topRes.rows
          .map(r => {
            const totalUsos    = Number(r.total_usos);
            const conDuracion  = Number(r.con_duracion);
            const duracionMedia = Number(r.duracion_media);
            const duracionMax  = Number(r.duracion_max);
            const score =
              Math.min(duracionMedia, 1800)          // cap a 30 min
              * (conDuracion / totalUsos)             // ratio de cobertura
              * Math.log10(1 + conDuracion);          // fiabilidad por volumen
            return {
              aplicacion: String(r.aplicacion),
              totalUsos,
              conDuracion,
              duracionMedia,
              duracionMax,
              score,
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 20),
      };
    }),
});
