import { NextRequest, NextResponse } from 'next/server';
import { calcularSWOLF } from '@/lib/calculadoras/deporte';
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
    const tiempo_s_largo: number = body.tiempo_s_largo;
    const brazadas_largo: number = body.brazadas_largo;
    const metros_largo: number = body.metros_largo ?? 25;

    if (!tiempo_s_largo || !brazadas_largo) {
      return NextResponse.json(
        { error: 'Faltan parámetros: tiempo_s_largo y brazadas_largo son obligatorios. metros_largo es opcional (25 o 50, defecto 25).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    if (![25, 50].includes(metros_largo)) {
      return NextResponse.json(
        { error: 'metros_largo debe ser 25 o 50.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularSWOLF(tiempo_s_largo, brazadas_largo, metros_largo);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-swolf-natacion', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      tiempo_s_largo,
      brazadas_largo,
      metros_largo,
      swolf: r.swolf,
      nivel: r.nivel,
      eficiencia: r.eficiencia,
      descripcion: r.descripcionNivel,
      velocidad_min_100m: r.velocidadMedia_min100m,
      consejo: r.consejo,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
