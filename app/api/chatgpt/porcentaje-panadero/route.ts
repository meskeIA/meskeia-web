import { NextRequest, NextResponse } from 'next/server';
import { calcularBakersPercentage } from '@/lib/calculadoras/cocina';
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
    const harina_g: number = body.harina_g;
    const ingredientes: { nombre: string; gramos: number }[] = body.ingredientes;
    const peso_porcion_g: number | undefined = body.peso_porcion_g;

    if (!harina_g || !ingredientes || !Array.isArray(ingredientes)) {
      return NextResponse.json(
        { error: 'Faltan parámetros: harina_g (número) e ingredientes (array de {nombre, gramos}) son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularBakersPercentage(harina_g, ingredientes, peso_porcion_g);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-porcentaje-panadero', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      harina_g: r.harina_g,
      peso_masa_total_g: r.pesoMasa_g,
      hidratacion_pct: r.hidratacion_pct,
      rendimiento_porciones: r.rendimiento_porciones ?? null,
      ingredientes: r.ingredientes.map(i => ({
        nombre: i.nombre,
        gramos: i.gramos,
        porcentaje_panadero: `${i.porcentajePanadero}%`,
      })),
      nota: 'El porcentaje del panadero siempre toma la harina como 100%. Cada ingrediente se expresa como % del peso de harina, no del peso total de la masa.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
