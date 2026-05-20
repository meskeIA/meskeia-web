import { NextRequest, NextResponse } from 'next/server';
import { calcularGanache, type TipoChocolate, type TexturaGanache } from '@/lib/calculadoras/cocina';
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
    const tipo_chocolate: TipoChocolate = body.tipo_chocolate ?? 'negro';
    const textura: TexturaGanache = body.textura ?? 'trufa';
    const total_g: number = body.total_g ?? 200;

    const tiposChocolate: TipoChocolate[] = ['negro_extra', 'negro', 'semi_fondant', 'con_leche', 'blanco'];
    const texturas: TexturaGanache[] = ['glaseado', 'trufa', 'firme'];

    if (!tiposChocolate.includes(tipo_chocolate) || !texturas.includes(textura)) {
      return NextResponse.json(
        { error: 'tipo_chocolate válidos: negro_extra|negro|semi_fondant|con_leche|blanco. textura válidos: glaseado|trufa|firme. total_g: gramos totales de ganache a preparar.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularGanache(tipo_chocolate, textura, total_g);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-ganache', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      tipo_chocolate: r.tipo_chocolate,
      rango_cacao: r.porcentaje_cacao,
      textura: r.textura,
      chocolate_g: r.chocolate_g,
      nata_g: r.nata_g,
      total_g: r.total_g,
      ratio: r.ratio_texto,
      temperatura_trabajo: r.temperatura_trabajo_c,
      usos: r.usos,
      nota_chocolate: r.nota,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
