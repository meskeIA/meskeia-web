import { NextRequest, NextResponse } from 'next/server';
import { calcularPotenciaCiclismo } from '@/lib/calculadoras/deporte';
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
    const peso_kg: number = body.peso_kg;
    const ftp_w: number = body.ftp_w;
    const desnivel_m: number | undefined = body.desnivel_m;
    const tiempo_min: number | undefined = body.tiempo_min;

    if (!peso_kg || !ftp_w) {
      return NextResponse.json(
        { error: 'Faltan parámetros: peso_kg y ftp_w son obligatorios. desnivel_m y tiempo_min son opcionales para calcular VAM.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularPotenciaCiclismo(peso_kg, ftp_w, desnivel_m, tiempo_min);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-potencia-ciclismo', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    const respuesta: Record<string, unknown> = {
      peso_kg,
      ftp_w,
      w_por_kg: r.wattsKg,
      nivel_w_kg: r.nivelWattsKg,
      descripcion_nivel: r.descripcionNivel,
      zonas_potencia: r.zonasPotencia.map(z => ({
        zona: z.zona,
        nombre: z.nombre,
        rango_ftp: z.porcentajeFTP,
        watts_min: z.wattsMin,
        watts_max: z.wattsMax,
      })),
    };

    if (r.vam !== null) {
      respuesta.vam_m_h = r.vam;
      respuesta.nivel_vam = r.nivelVam;
    }

    return NextResponse.json(respuesta, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
