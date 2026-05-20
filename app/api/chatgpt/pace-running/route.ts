import { NextRequest, NextResponse } from 'next/server';
import { calcularPaceRunning } from '@/lib/calculadoras/deporte';
import { getTursoClient, initializeDatabase } from '@/lib/turso';

const ALLOWED_ORIGINS = ['https://chat.openai.com', 'https://chatgpt.com'];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[1];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  try {
    const body = await req.json();
    const distancia_km: number = body.distancia_km;
    const tiempo_s: number = body.tiempo_s;

    if (!distancia_km || !tiempo_s) {
      return NextResponse.json(
        { error: 'Faltan parámetros: distancia_km y tiempo_s son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularPaceRunning(distancia_km, tiempo_s);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-pace-running', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      distancia_km,
      tiempo_total: `${Math.floor(tiempo_s / 3600)}h ${Math.floor((tiempo_s % 3600) / 60)}min ${tiempo_s % 60}s`,
      pace: r.paceFormateado,
      velocidad_km_h: r.velocidad_km_h,
      proyecciones: r.proyecciones.map(p => ({
        distancia: p.nombre,
        tiempo_estimado: p.tiempoFormateado,
      })),
      splits_primeros_5km: r.splits.slice(0, 5).map(s => ({
        km: s.km,
        tiempo_acumulado: s.tiempoFormateado,
      })),
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
