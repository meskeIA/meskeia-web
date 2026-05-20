import { NextRequest, NextResponse } from 'next/server';
import { calcularPrediccionRunning } from '@/lib/calculadoras/deporte';
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
    const distanciaBase_km: number = body.distancia_base_km;
    const tiempoBase_s: number = body.tiempo_base_s;
    const distanciaObjetivo_km: number = body.distancia_objetivo_km;

    if (!distanciaBase_km || !tiempoBase_s || !distanciaObjetivo_km) {
      return NextResponse.json(
        { error: 'Faltan parámetros: distancia_base_km, tiempo_base_s y distancia_objetivo_km son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularPrediccionRunning(distanciaBase_km, tiempoBase_s, distanciaObjetivo_km);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-tiempos-running', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      distancia_base_km: distanciaBase_km,
      tiempo_base: `${Math.floor(tiempoBase_s / 60)}min ${tiempoBase_s % 60}s`,
      distancia_objetivo_km: distanciaObjetivo_km,
      tiempo_estimado: r.tiempoFormateado,
      pace: r.paceFormateado,
      velocidad_km_h: r.velocidad_km_h,
      predicciones_estandar: r.prediccionesEstandar.map(p => ({
        distancia: p.nombre,
        tiempo: p.tiempoFormateado,
        pace: p.paceFormateado,
      })),
      advertencia: r.advertencia,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
