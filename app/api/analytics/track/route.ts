/**
 * API Route: Guardar Uso de Aplicación
 * Endpoint: POST /api/analytics/track
 *
 * Reemplaza: api/v1/guardar-uso.php
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

// Configuración para edge runtime (más rápido en Vercel)
export const runtime = 'edge';

// Permitir CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Inicializar DB si es necesario
    await initializeDatabase();

    const datos = await request.json();

    // Validar campo obligatorio
    if (!datos.aplicacion) {
      return NextResponse.json(
        { status: 'error', message: 'El campo "aplicacion" es obligatorio' },
        { status: 400, headers: corsHeaders }
      );
    }

    const client = getTursoClient();

    // Preparar datos
    const aplicacion = datos.aplicacion;
    const timestamp = new Date().toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const navegador = datos.navegador || null;
    const sistema_operativo = datos.sistema_operativo || null;
    const resolucion = datos.resolucion || null;
    const tipo_dispositivo = datos.tipo_dispositivo || null;
    const es_recurrente = datos.es_recurrente ? 1 : 0;
    const modo = datos.modo || 'web';
    const sesion_id = datos.sesion_id || null;

    // Obtener IP del cliente (Vercel proporciona esto en headers)
    const ip_address =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;

    // Geolocalización (intentar obtener país/ciudad)
    let pais: string | null = null;
    let ciudad: string | null = null;

    if (ip_address && ip_address !== '127.0.0.1' && ip_address !== '::1') {
      try {
        const geoResponse = await fetch(
          `http://ip-api.com/json/${ip_address}?fields=status,country,city`,
          { signal: AbortSignal.timeout(2000) }
        );
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            pais = geoData.country || null;
            ciudad = geoData.city || null;
          }
        }
      } catch {
        // Geolocalización falla silenciosamente
      }
    }

    // Datos adicionales como JSON
    const datos_adicionales = datos.datos_adicionales
      ? JSON.stringify(datos.datos_adicionales)
      : null;

    // Insertar registro
    const result = await client.execute({
      sql: `INSERT INTO uso_aplicaciones
            (aplicacion, timestamp, navegador, sistema_operativo, resolucion,
             tipo_dispositivo, es_recurrente, ip_address, pais, ciudad,
             modo, sesion_id, datos_adicionales)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        aplicacion,
        timestamp,
        navegador,
        sistema_operativo,
        resolucion,
        tipo_dispositivo,
        es_recurrente,
        ip_address,
        pais,
        ciudad,
        modo,
        sesion_id,
        datos_adicionales,
      ],
    });

    return NextResponse.json(
      {
        status: 'success',
        message: 'Uso registrado correctamente',
        data: {
          id: Number(result.lastInsertRowid),
          aplicacion,
          timestamp,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error en /api/analytics/track:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
