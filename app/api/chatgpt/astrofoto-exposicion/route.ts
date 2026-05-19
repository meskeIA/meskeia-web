import { NextRequest, NextResponse } from 'next/server';
import { calcularAstrofoto, SENSORES, TipoSensor } from '@/lib/calculadoras/fotografia';
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
    const focalMM: number = body.focal_mm;
    const apertura: number = body.apertura;
    const sensor: TipoSensor = body.sensor ?? 'ff';
    const megapixeles: number = body.megapixeles ?? 24;
    const declinacion: number = body.declinacion_grados ?? 0;
    const tiempoElegido: number = body.tiempo_elegido_s ?? 20;

    if (!focalMM || !apertura) {
      return NextResponse.json(
        { error: 'Faltan parámetros: focal_mm y apertura son obligatorios.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    if (!['ff', 'apsc15', 'apsc16', 'm43'].includes(sensor)) {
      return NextResponse.json(
        { error: 'sensor debe ser: ff, apsc15, apsc16 o m43.' },
        { status: 400, headers: corsHeaders(origin) },
      );
    }

    const r = calcularAstrofoto(focalMM, apertura, sensor, megapixeles, declinacion, tiempoElegido);
    const s = SENSORES[sensor];

    try {
      await initializeDatabase();
      const db = getTursoClient();
      await db.execute({
        sql: `INSERT INTO analytics (app_name, created_at, mode) VALUES (?, ?, ?)`,
        args: ['calculadora-regla-500-npf-astrofoto', new Date().toISOString(), 'chatgpt'],
      });
    } catch { /* analytics no crítico */ }

    return NextResponse.json({
      sensor_usado: s.nombre,
      focal_mm: focalMM,
      focal_equivalente_ff_mm: r.focalEquivalenteFF,
      apertura: `f/${apertura}`,
      megapixeles,
      pixel_pitch_um: Math.round(r.pixelPitchUm * 100) / 100,
      declinacion_grados: declinacion,
      tiempo_maximo_npf_s: r.tiempoNPF_s === null ? 'infinito (cerca de Polaris)' : Math.round(r.tiempoNPF_s * 10) / 10,
      tiempo_maximo_500_s: Math.round(r.tiempo500_s * 10) / 10,
      tiempo_maximo_300_s: Math.round(r.tiempo300_s * 10) / 10,
      tiempo_evaluado_s: tiempoElegido,
      veredicto: r.veredicto,
      descripcion: r.descripcionVeredicto,
      recomendacion: r.tiempoNPF_s !== null
        ? `Usa ${Math.floor(r.tiempoNPF_s)} s o menos para estrellas puntuales perfectas.`
        : 'Con esta declinación puedes exponer sin límite práctico de estelas.',
    }, { headers: corsHeaders(origin) });

  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud.' },
      { status: 500, headers: corsHeaders(origin) },
    );
  }
}
