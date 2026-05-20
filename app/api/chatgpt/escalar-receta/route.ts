import { NextRequest, NextResponse } from 'next/server';
import { escalarReceta, type CategoriaIngrediente } from '@/lib/calculadoras/cocina';
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
    const raciones_original: number = body.raciones_original;
    const raciones_nueva: number = body.raciones_nueva;
    const ingredientes: { nombre: string; cantidad: number; unidad: string; categoria?: CategoriaIngrediente }[] = body.ingredientes;

    if (!raciones_original || !raciones_nueva || !ingredientes || !Array.isArray(ingredientes)) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: raciones_original, raciones_nueva, ingredientes (array de {nombre, cantidad, unidad, categoria?}). Categorías disponibles: normal|levadura|impulsores|sal|especias.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = escalarReceta(raciones_original, raciones_nueva, ingredientes);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['escalador-recetas', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      raciones_original: r.raciones_original,
      raciones_nueva: r.raciones_nueva,
      factor_escala: r.factor_escala,
      ingredientes: r.ingredientes.map(i => ({
        nombre: i.nombre,
        cantidad_original: `${i.cantidad_original} ${i.unidad}`,
        cantidad_nueva: `${i.cantidad_nueva} ${i.unidad}`,
        cantidad_redondeada: i.cantidad_redondeada,
        categoria: i.categoria,
        nota: i.nota ?? null,
      })),
      nota_horno: r.nota_horno,
      advertencias: r.advertencias,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
