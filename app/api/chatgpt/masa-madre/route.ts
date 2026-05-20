import { NextRequest, NextResponse } from 'next/server';
import { calcularSustitucionMasaMadre, type TipoLevaduraOrigen } from '@/lib/calculadoras/cocina';
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
    const tipo_levadura: TipoLevaduraOrigen = body.tipo_levadura ?? 'seca';
    const levadura_g: number = body.levadura_g;
    const hidratacion_mm_pct: number = body.hidratacion_mm_pct ?? 100;

    if (!levadura_g) {
      return NextResponse.json(
        { error: 'Parámetros requeridos: levadura_g (cantidad de levadura a sustituir). Opcionales: tipo_levadura (fresca|seca|instantanea, por defecto "seca"), hidratacion_mm_pct (% hidratación de tu masa madre, por defecto 100).' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularSustitucionMasaMadre(tipo_levadura, levadura_g, hidratacion_mm_pct);

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-masa-madre', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      levadura_original: {
        tipo: r.levadura_original_tipo,
        cantidad_g: r.levadura_original_g,
      },
      masa_madre_necesaria_g: r.masa_madre_g,
      hidratacion_masa_madre_pct: r.hidratacion_mm_pct,
      ajuste_receta: {
        restar_harina_g: r.harina_restar_g,
        restar_agua_g: r.agua_restar_g,
        explicacion: r.nota,
      },
      tiempo_fermentacion_orientativo: r.tiempo_fermentacion,
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
