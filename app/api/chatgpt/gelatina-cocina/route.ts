import { NextRequest, NextResponse } from 'next/server';
import { calcularSustitucionGelatina, type TipoGelatina } from '@/lib/calculadoras/cocina';
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
    const tipo_origen: TipoGelatina = body.tipo_origen;
    const cantidad: number = body.cantidad;
    const unidad: 'gramos' | 'hojas' = body.unidad ?? 'gramos';

    const tiposValidos: TipoGelatina[] = ['hoja_bronce', 'hoja_plata', 'hoja_oro', 'hoja_platino', 'polvo_200', 'polvo_250', 'agar_agar'];
    if (!tipo_origen || !tiposValidos.includes(tipo_origen) || !cantidad) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: tipo_origen (hoja_bronce|hoja_plata|hoja_oro|hoja_platino|polvo_200|polvo_250|agar_agar), cantidad (número). Opcional: unidad (gramos|hojas, por defecto gramos).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularSustitucionGelatina(tipo_origen, cantidad, unidad);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-gelatina', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      origen: {
        tipo: r.origen.tipo,
        nombre: r.origen.nombre,
        cantidad_g: r.origen.cantidad_g,
        hojas: r.origen.hojas ?? null,
        notas: r.origen.notas,
      },
      equivalentes: r.equivalentes.map(e => ({
        tipo: e.tipo,
        nombre: e.nombre,
        cantidad_g: e.cantidad_g,
        hojas: e.hojas ?? null,
        notas: e.notas,
      })),
      advertencia_agar: r.advertencia_agar,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
