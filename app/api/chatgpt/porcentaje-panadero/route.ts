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
    // `prefermento_hidratacion_pct` marca los ingredientes que son harina y agua ya mezcladas
    // (masa madre, poolish, biga): sin él la hidratación devuelta no cuenta lo que llevan dentro.
    const ingredientes: { nombre: string; gramos: number; prefermento_hidratacion_pct?: number }[] =
      body.ingredientes;
    const peso_porcion_g: number | undefined = body.peso_porcion_g;

    if (!harina_g || !ingredientes || !Array.isArray(ingredientes)) {
      return NextResponse.json(
        { error: 'Faltan parámetros: harina_g (número) e ingredientes (array de {nombre, gramos}) son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularBakersPercentage(
      harina_g,
      ingredientes.map(i => ({
        nombre: i.nombre,
        gramos: i.gramos,
        prefermentoHidratacion_pct: i.prefermento_hidratacion_pct,
      })),
      peso_porcion_g,
    );

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-porcentaje-panadero', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    const hayPrefermentos = r.prefermentos.length > 0;

    return NextResponse.json({
      harina_total_g: r.harina_g,
      harina_a_pesar_g: r.harinaAnadida_g,
      agua_total_g: r.agua_g,
      agua_a_pesar_g: r.aguaAnadida_g,
      peso_masa_total_g: r.pesoMasa_g,
      hidratacion_pct: r.hidratacion_pct,
      harina_prefermentada_pct: r.harinaPrefermentada_pct,
      rendimiento_porciones: r.rendimiento_porciones ?? null,
      ingredientes: r.ingredientes.map(i => ({
        nombre: i.nombre,
        gramos: i.gramos,
        porcentaje_panadero: `${i.porcentajePanadero}%`,
      })),
      prefermentos: r.prefermentos.map(p => ({
        nombre: p.nombre,
        gramos: p.gramos,
        hidratacion_pct: p.hidratacion_pct,
        harina_que_aporta_g: p.harina_g,
        agua_que_aporta_g: p.agua_g,
      })),
      nota: hayPrefermentos
        ? 'El 100% es la harina TOTAL: la que se pesa aparte más la que llega dentro del prefermento. La hidratación cuenta también el agua del prefermento, así que es la real de la masa. En la balanza se pesan harina_a_pesar_g y agua_a_pesar_g, más el prefermento entero.'
        : 'El porcentaje del panadero siempre toma la harina como 100%. Cada ingrediente se expresa como % del peso de harina, no del peso total de la masa.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
