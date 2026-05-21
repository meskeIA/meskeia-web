/**
 * Router de Analytics para tRPC
 * Migra la lógica de /api/analytics/* a procedures type-safe
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { getTursoClient, initializeDatabase, formatearDuracion } from '@/lib/turso';

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
      let rankingSql = `
        SELECT
          aplicacion,
          COUNT(*) as total_usos,
          MAX(timestamp) as ultimo_uso,
          AVG(CASE WHEN duracion_segundos IS NOT NULL THEN duracion_segundos END) as duracion_promedio_segundos
        FROM uso_aplicaciones
        WHERE 1=1
      `;
      const rankingArgs: string[] = [];
      if (ipExcluida) {
        rankingSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        rankingArgs.push(ipExcluida);
      }
      rankingSql += ' GROUP BY aplicacion ORDER BY total_usos DESC';

      const rankingResult = await client.execute({ sql: rankingSql, args: rankingArgs });

      const rankingAplicaciones = rankingResult.rows.map((app) => {
        const usos = Number(app.total_usos);
        let estado = '⚠️ Muy bajo';
        if (usos >= 50) estado = '✅ Activa';
        else if (usos >= 10) estado = '⚠️ Bajo uso';

        return {
          aplicacion: app.aplicacion,
          total_usos: usos,
          ultimo_uso: app.ultimo_uso,
          duracion_promedio_segundos: Number(app.duracion_promedio_segundos) || 0,
          duracion_promedio_formato: formatearDuracion(
            Math.round(Number(app.duracion_promedio_segundos) || 0)
          ),
          estado,
        };
      });

      // Estadísticas geográficas (con filtro de IP si está activo)
      let paisesSql = `
        SELECT pais, COUNT(*) as total
        FROM uso_aplicaciones
        WHERE pais IS NOT NULL AND pais != ''
      `;
      const paisesArgs: string[] = [];
      if (ipExcluida) {
        paisesSql += ' AND (ip_address IS NULL OR ip_address != ?)';
        paisesArgs.push(ipExcluida);
      }
      paisesSql += ' GROUP BY pais ORDER BY total DESC LIMIT 10';
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

      const contarEnRango = async (fechaInicio: Date, fechaFin: Date): Promise<number> => {
        let sqlCount = `
          SELECT COUNT(*) as total
          FROM uso_aplicaciones
          WHERE substr(timestamp, 7, 4) || substr(timestamp, 4, 2) || substr(timestamp, 1, 2) >= ?
            AND substr(timestamp, 7, 4) || substr(timestamp, 4, 2) || substr(timestamp, 1, 2) <= ?
        `;
        const argsCount: string[] = [
          `${fechaInicio.getFullYear()}${String(fechaInicio.getMonth() + 1).padStart(2, '0')}${String(fechaInicio.getDate()).padStart(2, '0')}`,
          `${fechaFin.getFullYear()}${String(fechaFin.getMonth() + 1).padStart(2, '0')}${String(fechaFin.getDate()).padStart(2, '0')}`,
        ];

        if (ipExcluida) {
          sqlCount += ' AND (ip_address IS NULL OR ip_address != ?)';
          argsCount.push(ipExcluida);
        }

        const result = await client.execute({ sql: sqlCount, args: argsCount });
        return Number(result.rows[0]?.total) || 0;
      };

      const usosHoy = await contarEnRango(hoy, hoy);
      const usosAyer = await contarEnRango(ayer, ayer);
      const usosUltimos7Dias = await contarEnRango(hace7Dias, hoy);
      const usosSemanaAnterior = await contarEnRango(hace14Dias, hace7Dias);
      const usosMesActual = await contarEnRango(inicioMesActual, hoy);
      const usosMesAnterior = await contarEnRango(inicioMesAnterior, finMesAnterior);

      const calcularVariacion = (actual: number, anterior: number) => {
        if (anterior === 0) {
          return { porcentaje: actual > 0 ? 100 : 0, tendencia: actual > 0 ? ('up' as const) : ('neutral' as const) };
        }
        const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
        const tendencia = porcentaje > 0 ? ('up' as const) : porcentaje < 0 ? ('down' as const) : ('neutral' as const);
        return { porcentaje: Math.abs(porcentaje), tendencia };
      };

      const anteayer = new Date(hoy); anteayer.setDate(hoy.getDate() - 2);
      const usosAnteayer = await contarEnRango(anteayer, anteayer);

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
          comparacion: calcularVariacion(usosHoy, usosAyer),
          etiqueta: 'vs ayer',
        },
        ayer: {
          usos: usosAyer,
          comparacion: calcularVariacion(usosAyer, usosAnteayer),
          etiqueta: 'vs anteayer',
          fecha: formatoEspanol(ayer),
        },
        semana: {
          usos: usosUltimos7Dias,
          comparacion: calcularVariacion(usosUltimos7Dias, usosSemanaAnterior),
          etiqueta: 'vs semana anterior',
        },
        mes: {
          usos: usosMesActual,
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
});
