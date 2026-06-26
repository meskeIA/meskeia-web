/**
 * API Route: Guardar Uso de Aplicación
 * Endpoint: POST /api/analytics/track
 *
 * Reemplaza: api/v1/guardar-uso.php
 *
 * RGPD: No almacena IP completa ni datos identificables.
 * Geolocalización (solo país) vía headers de Vercel, sin servicios externos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTursoClient, initializeDatabase } from '@/lib/turso';
import { getCorsHeaders } from '@/lib/cors';

// Configuración para edge runtime (más rápido en Vercel)
export const runtime = 'edge';

/**
 * Anonimiza una dirección IP truncando el último octeto (IPv4)
 * o los últimos 80 bits (IPv6).
 * Ejemplo: 83.45.123.67 → 83.45.123.0
 */
function anonymizeIP(ip: string): string {
  // IPv4: reemplazar último octeto por 0
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }
  // IPv6: truncar últimos 5 grupos (80 bits)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return parts.slice(0, 3).join(':') + '::';
    }
  }
  return 'anonymous';
}

/**
 * Rangos de IPs de datacenters cloud conocidos.
 * Estos rangos NO albergan navegadores humanos: son crawlers, scrapers o
 * peticiones automatizadas. Se marcan como modo='bot' para no contaminar
 * las métricas de tráfico real.
 *
 * Detectados empíricamente en datos reales (2026-05-06):
 * - Tencent Cloud (HK + China continental + Singapur)
 * - AWS Singapur
 *
 * Mantener esta lista actualizada cuando aparezcan nuevos patrones de
 * scraping en el dashboard de geografía.
 */
const DATACENTER_PATTERNS: RegExp[] = [
  // Tencent Cloud — bloques 43.128/15 y 43.152/14
  /^43\.(12[89]|13\d|14[0-3]|15[2-9])\./,
  // Tencent Cloud — otros rangos
  /^49\.232\./,
  /^82\.15[67]\./,
  /^101\.(32|42)\./,
  /^119\.28\./,
  /^124\.156\./,
  /^129\.226\./,
  /^140\.143\./,
  /^150\.109\./,
  /^152\.136\./,
  /^192\.144\./,
  // AWS Singapur (rangos detectados)
  /^47\.12[89]\./,
  /^18\.136\./,
  /^43\.17[2-3]\./,
];

/** Comprueba si la IP de origen pertenece a un datacenter cloud conocido. */
function esIpDatacenter(ip: string | null): boolean {
  if (!ip) return false;
  return DATACENTER_PATTERNS.some(p => p.test(ip));
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders('POST, OPTIONS') });
}

/** Trunca un string a un máximo de caracteres, devuelve null si está vacío */
function truncar(val: unknown, max: number): string | null {
  if (!val || typeof val !== 'string') return null;
  return val.slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    // Filtrar bots y rastreadores conocidos (Googlebot, Bingbot, etc.)
    const userAgent = request.headers.get('user-agent') || '';
    const botsPattern = /Googlebot|Google-InspectionTool|AdsBot-Google|APIs-Google|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|Applebot|Screaming Frog|AhrefsBot|SemrushBot|MJ12bot|DotBot|PetalBot|GPTBot|ClaudeBot|anthropic-ai/i;

    const esBot = botsPattern.test(userAgent);

    // Señal adicional de automatización: los navegadores reales SIEMPRE envían
    // la cabecera Accept-Language. Las granjas headless que rotan IP (decenas de
    // IPs distintas, mismo User-Agent + resolución, concentradas en una sola app)
    // suelen omitirla y hoy entran como modo='web', inflando "registros" sin subir
    // "apps distintas". Marcarlas como bot las excluye de las métricas reales,
    // porque el rollup ya ignora modo='bot'. Heurística barata y conservadora:
    // ante dudas se puede afinar más adelante con un control por frecuencia.
    const acceptLanguage = request.headers.get('accept-language') || '';
    const sinIdioma = acceptLanguage.trim() === '';

    // Inicializar DB si es necesario
    await initializeDatabase();

    const datos = await request.json();

    // Validar campo obligatorio
    if (!datos.aplicacion || typeof datos.aplicacion !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'El campo "aplicacion" es obligatorio' },
        { status: 400, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
      );
    }

    const client = getTursoClient();

    // Preparar datos con límites de longitud (H5/L1: prevenir abuso con payloads grandes)
    const aplicacion = datos.aplicacion.slice(0, 100);
    const timestamp = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const navegador = truncar(datos.navegador, 200);
    const sistema_operativo = truncar(datos.sistema_operativo, 200);
    const resolucion = truncar(datos.resolucion, 50);
    const tipo_dispositivo = truncar(datos.tipo_dispositivo, 50);
    const es_recurrente = datos.es_recurrente ? 1 : 0;
    const sesion_id = truncar(datos.sesion_id, 50);

    // RGPD: Anonimizar IP (truncar último octeto)
    const rawIP =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null;
    const ip_address = rawIP ? anonymizeIP(rawIP) : null;

    // Detección compuesta de bot: por user agent O por IP de datacenter cloud
    const esBotIP = esIpDatacenter(rawIP);
    const modo = (esBot || esBotIP || sinIdioma) ? 'bot' : (truncar(datos.modo, 20) || 'web');

    // RGPD: Geolocalización solo país, vía headers de Vercel (sin servicios externos)
    // Siempre código ISO alpha-2 (x-vercel-ip-country) para consistencia en DB
    const pais = request.headers.get('x-vercel-ip-country') || null;

    // RGPD: No almacenar ciudad (dato demasiado específico)
    const ciudad: string | null = null;

    // Datos adicionales como JSON
    const datos_adicionales = datos.datos_adicionales
      ? JSON.stringify(datos.datos_adicionales)
      : null;

    // Dominio de entrada (vertical): se deriva en el SERVIDOR a partir de los
    // headers, no del cliente (más fiable, no manipulable). x-forwarded-host es
    // el dominio público real tras el proxy/rewrite de Vercel; host como fallback.
    // Se normaliza a minúsculas y sin 'www.' para agrupar variantes.
    const rawHost = (
      request.headers.get('x-forwarded-host') ||
      request.headers.get('host') ||
      ''
    ).split(',')[0].trim().toLowerCase().replace(/^www\./, '');
    const host = rawHost ? rawHost.slice(0, 100) : null;

    // Insertar registro
    const result = await client.execute({
      sql: `INSERT INTO uso_aplicaciones
            (aplicacion, timestamp, navegador, sistema_operativo, resolucion,
             tipo_dispositivo, es_recurrente, ip_address, pais, ciudad,
             modo, sesion_id, datos_adicionales, host)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        host,
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
      { status: 201, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  } catch (error) {
    console.error('Error en /api/analytics/track:', error);
    return NextResponse.json(
      { status: 'error', message: 'Error interno del servidor' },
      { status: 500, headers: getCorsHeaders('POST, OPTIONS', request.headers.get('origin')) }
    );
  }
}
