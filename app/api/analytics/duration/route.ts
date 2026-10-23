/**
 * API Route: Guardar Duración de Sesión
 * Endpoint: POST /api/analytics/duration
 *
 * Reemplaza: api/v1/guardar-duracion.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso';
import { getCorsHeaders } from '@/lib/cors';

// Runtime nodejs: el Edge Runtime está deprecado desde Next 16.3.0 (detectado 2026-08-10)
export const runtime = 'nodejs';

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders('POST, OPTIONS') });
}

export async function POST(request: NextRequest) {
  try {
    // Leer como texto y parsear manualmente: sendBeacon en iOS envía text/plain,
    // fetch envía application/json — ambos llevan JSON como cuerpo
    const raw = await request.text();
    const datos = JSON.parse(raw);

    // Validar campos obligatorios
    if (!datos.aplicacion || typeof datos.aplicacion !== 'string' || datos.duracion_segundos === undefined) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Campos "aplicacion" y "duracion_segundos" son obligatorios',
        },
        { status: 400, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
      );
    }

    // H5/L1: Validar que la duración sea un número razonable (0s - 24h)
    const duracionRaw = Number(datos.duracion_segundos);
    if (isNaN(duracionRaw) || duracionRaw < 0 || duracionRaw > 86400) {
      return NextResponse.json(
        { status: 'error', message: 'Duración fuera de rango (0-86400 segundos)' },
        { status: 400, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
      );
    }

    // Cap a 30 min (mismo valor que CAP_DUR del rollup): las duraciones mayores
    // casi siempre son pestañas olvidadas abiertas que disparan beforeunload horas
    // después (se han visto valores de >50 h). Para una visión orientativa no
    // aportan y distorsionan medias y máximos. Capamos ya en la ingesta para que
    // la tabla cruda quede coherente con el rollup, sin perder utilidad real.
    const CAP_DURACION = 1800;
    const duracion = Math.min(duracionRaw, CAP_DURACION);

    const aplicacion = datos.aplicacion.slice(0, 100);
    const sesion_id = datos.sesion_id && typeof datos.sesion_id === 'string'
      ? datos.sesion_id.slice(0, 50)
      : null;

    const client = getTursoClient();

    // Buscar el último registro de esta aplicación/sesión para actualizar duración
    // Si hay sesion_id, usarlo para encontrar el registro exacto
    if (sesion_id) {
      // Actualizar SOLO el registro de entrada (el último de esa sesión+app), no
      // todas sus filas: si una sesión tuviera varias entradas de la misma app,
      // el WHERE plano les ponía a todas la misma duración e inflaba las medias.
      //
      // Se queda con el MAYOR de los dos valores, no con el último (23/10/2026). El tracker
      // envía el tiempo visible ACUMULADO de la visita, que solo crece, así que con los
      // envíos en orden el MAX da lo mismo que el SET. Cubre los dos casos en que no llegan
      // en orden: el beacon de «ocultar pestaña» que aterriza después del de salida, y el
      // de una visita de 0-1 s que llega antes que su propio INSERT —desde que no hay umbral
      // mínimo— y caería sobre la visita anterior de la misma app en esa sesión. Con SET la
      // pisaría; con MAX solo la toca si tenía menos que esos 0-1 s. Un envío repetido
      // tampoco puede inflar: repite la cifra.
      // MAX escalar de SQLite devuelve NULL si un argumento es NULL: de ahí el COALESCE.
      await client.execute({
        sql: `UPDATE uso_aplicaciones
              SET duracion_segundos = MAX(COALESCE(duracion_segundos, 0), ?)
              WHERE id = (
                SELECT id FROM uso_aplicaciones
                WHERE sesion_id = ? AND aplicacion = ?
                ORDER BY id DESC LIMIT 1
              )`,
        args: [duracion, sesion_id, aplicacion],
      });
    } else {
      // Fallback: actualizar el último registro de esta app sin duración
      await client.execute({
        sql: `UPDATE uso_aplicaciones
              SET duracion_segundos = ?
              WHERE id = (
                SELECT id FROM uso_aplicaciones
                WHERE aplicacion = ? AND duracion_segundos IS NULL
                ORDER BY id DESC LIMIT 1
              )`,
        args: [duracion, aplicacion],
      });
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Duración registrada correctamente',
        data: { aplicacion, duracion_segundos: duracion },
      },
      { status: 200, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  } catch (error) {
    console.error('Error en /api/analytics/duration:', error);
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  }
}
