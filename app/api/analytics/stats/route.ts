/**
 * API Route: Estadísticas de Uso
 * Endpoint: GET /api/analytics/stats
 *
 * Reemplaza: api/v1/estadisticas.php
 *
 * Parámetros opcionales (query string):
 * - aplicacion: Filtrar por nombre de aplicación
 * - desde: Fecha inicio (formato: DD/MM/YYYY)
 * - hasta: Fecha fin (formato: DD/MM/YYYY)
 * - limite: Número máximo de registros (default: 100)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase, formatearDuracion } from '@/lib/turso';

// Configuración para edge runtime
export const runtime = 'edge';

// Permitir CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Inicializar DB si es necesario
    await initializeDatabase();

    const { searchParams } = new URL(request.url);
    const aplicacion = searchParams.get('aplicacion');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    const limite = parseInt(searchParams.get('limite') || '100', 10);
    const excluirMiIP = searchParams.get('excluir_mi_ip') === 'true';

    const client = getTursoClient();

    // Obtener IP excluida si el filtro está activo
    let ipExcluida = '';
    if (excluirMiIP) {
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

    // ============================================
    // COMPARATIVA TEMPORAL (nuevo en v3.1)
    // ============================================

    // Función helper para obtener fecha en formato español DD/MM/YYYY
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

    // Función para contar registros en un rango de fechas (formato español DD/MM/YYYY)
    const contarEnRango = async (fechaInicio: Date, fechaFin: Date): Promise<number> => {
      // El timestamp en la DB está en formato "DD/MM/YYYY, HH:MM:SS"
      // Necesitamos filtrar comparando la parte de fecha
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

    // Calcular métricas comparativas
    const usosHoy = await contarEnRango(hoy, hoy);
    const usosAyer = await contarEnRango(ayer, ayer);
    const usosUltimos7Dias = await contarEnRango(hace7Dias, hoy);
    const usosSemanaAnterior = await contarEnRango(hace14Dias, hace7Dias);
    const usosMesActual = await contarEnRango(inicioMesActual, hoy);
    const usosMesAnterior = await contarEnRango(inicioMesAnterior, finMesAnterior);

    // Calcular variaciones porcentuales
    const calcularVariacion = (actual: number, anterior: number): { porcentaje: number; tendencia: 'up' | 'down' | 'neutral' } => {
      if (anterior === 0) {
        return { porcentaje: actual > 0 ? 100 : 0, tendencia: actual > 0 ? 'up' : 'neutral' };
      }
      const porcentaje = Math.round(((actual - anterior) / anterior) * 100);
      const tendencia = porcentaje > 0 ? 'up' : porcentaje < 0 ? 'down' : 'neutral';
      return { porcentaje: Math.abs(porcentaje), tendencia };
    };

    const comparativa = {
      hoy: {
        usos: usosHoy,
        comparacion: calcularVariacion(usosHoy, usosAyer),
        etiqueta: 'vs ayer',
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
        semanaAnterior: usosSemanaAnterior,
        mesAnterior: usosMesAnterior,
      },
    };

    return NextResponse.json(
      {
        status: 'success',
        version: 'v3.1-turso',
        filtros: {
          aplicacion,
          desde,
          hasta,
          limite,
          excluir_mi_ip: excluirMiIP,
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
          geografia: {
            paises: paisesResult.rows,
            ciudades: ciudadesResult.rows,
          },
        },
        comparativa,
        registros_mostrados: registros.length,
        ranking_aplicaciones: rankingAplicaciones,
        data: registros,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/analytics/stats:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
